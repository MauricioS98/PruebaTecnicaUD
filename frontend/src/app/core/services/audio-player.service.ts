import { Injectable, computed, signal } from '@angular/core';

export interface PlaybackTrack {
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly audio = new Audio();
  private loadGeneration = 0;
  private suppressEnded = false;

  readonly queue = signal<PlaybackTrack[]>([]);
  readonly playlist = signal<PlaybackTrack[]>([]);
  readonly currentIndex = signal(-1);
  readonly activeTrack = signal<PlaybackTrack | null>(null);
  readonly isOpen = signal(false);
  readonly queuePanelOpen = signal(false);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly currentTrack = computed(() => {
    const index = this.currentIndex();
    const tracks = this.queue();
    if (index >= 0 && index < tracks.length) {
      return tracks[index];
    }
    return this.activeTrack();
  });

  readonly hasActivePlayer = computed(() => this.isOpen() || this.playlist().length > 0);

  readonly playlistCount = computed(() => this.playlist().length);

  readonly panelTracks = computed(() => {
    if (this.isOpen() && this.queue().length > 0) {
      return this.queue();
    }
    return this.playlist();
  });

  readonly panelTitle = computed(() =>
    this.isOpen() && this.queue().length > 0 ? 'Reproduciendo' : 'Fila de reproducción'
  );

  readonly canGoPrevious = computed(() => {
    if (this.currentIndex() > 0) return true;
    return this.currentIndex() === 0 && this.currentTime() > 3;
  });

  readonly canGoNext = computed(() => {
    const index = this.currentIndex();
    const tracks = this.queue();
    return index >= 0 && index < tracks.length - 1;
  });

  readonly progress = computed(() => {
    const duration = this.duration();
    if (!duration) return 0;
    return (this.currentTime() / duration) * 100;
  });

  constructor() {
    this.audio.preload = 'auto';

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
      if (Number.isFinite(this.audio.duration)) {
        this.duration.set(this.audio.duration);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(this.audio.duration)) {
        this.duration.set(this.audio.duration);
      }
    });

    this.audio.addEventListener('ended', () => this.onTrackEnded());
    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
  }

  playTracks(tracks: PlaybackTrack[], startIndex = 0): void {
    if (!tracks.length) return;

    const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    this.isOpen.set(true);
    this.queue.set([...tracks]);
    void this.loadAndPlay(safeIndex);
  }

  playSingle(track: PlaybackTrack): void {
    this.playTracks([track], 0);
  }

  togglePlaylist(track: PlaybackTrack): void {
    const exists = this.playlist().some((t) => t.id === track.id);
    if (exists) {
      this.removeFromPlaylist(track.id);
      return;
    }
    this.playlist.update((list) => [...list, track]);
  }

  isInPlaylist(id: number): boolean {
    return this.playlist().some((t) => t.id === id);
  }

  removeFromPlaylist(id: number): void {
    this.removeTrack(id);
  }

  removeTrack(id: number): void {
    this.playlist.update((list) => list.filter((t) => t.id !== id));

    const queue = this.queue();
    const removeIndex = queue.findIndex((t) => t.id === id);
    if (removeIndex < 0) {
      this.closePanelIfEmpty();
      return;
    }

    const wasPlaying = this.isOpen();
    const wasCurrent = this.isCurrentTrack(id);
    const currentIdx = this.currentIndex();
    const newQueue = queue.filter((t) => t.id !== id);

    if (!newQueue.length) {
      this.queue.set([]);
      if (wasPlaying) {
        this.stop();
      } else {
        this.closePanelIfEmpty();
      }
      return;
    }

    this.queue.set(newQueue);

    if (!wasPlaying) {
      this.closePanelIfEmpty();
      return;
    }

    if (wasCurrent) {
      const nextIndex = Math.min(removeIndex, newQueue.length - 1);
      void this.loadAndPlay(nextIndex);
      return;
    }

    if (removeIndex < currentIdx) {
      this.currentIndex.set(currentIdx - 1);
    }
  }

  private closePanelIfEmpty(): void {
    if (!this.playlist().length && !this.isOpen()) {
      this.queuePanelOpen.set(false);
    }
  }

  clearPlaylist(): void {
    this.playlist.set([]);
    if (!this.isOpen()) {
      this.queuePanelOpen.set(false);
    }
  }

  playPlaylist(): void {
    const tracks = this.playlist();
    if (!tracks.length) return;
    this.playTracks(tracks, 0);
  }

  playAtIndex(index: number): void {
    if (index < 0 || index >= this.queue().length) return;
    void this.loadAndPlay(index);
  }

  toggleQueuePanel(): void {
    this.queuePanelOpen.update((open) => !open);
  }

  openQueuePanel(): void {
    this.queuePanelOpen.set(true);
  }

  closeQueuePanel(): void {
    this.queuePanelOpen.set(false);
  }

  togglePlay(): void {
    if (!this.currentTrack()) return;

    if (this.audio.paused) {
      void this.audio.play().catch(() => this.isPlaying.set(false));
    } else {
      this.audio.pause();
    }
  }

  next(): void {
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.queue().length) return;
    void this.loadAndPlay(nextIndex);
  }

  previous(): void {
    if (this.currentIndex() === 0 && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    const prevIndex = this.currentIndex() - 1;
    if (prevIndex < 0) return;
    void this.loadAndPlay(prevIndex);
  }

  seekByPercent(percent: number): void {
    if (!Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = (percent / 100) * this.audio.duration;
  }

  stop(): void {
    this.loadGeneration += 1;
    this.suppressEnded = false;
    this.isOpen.set(false);
    this.activeTrack.set(null);
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.isPlaying.set(false);
    this.currentIndex.set(-1);
    this.currentTime.set(0);
    this.duration.set(0);
    this.queue.set([]);
    if (!this.playlist().length) {
      this.queuePanelOpen.set(false);
    }
  }

  isCurrentTrack(id: number): boolean {
    return this.currentTrack()?.id === id;
  }

  private onTrackEnded(): void {
    if (this.suppressEnded) return;

    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.queue().length) {
      this.isPlaying.set(false);
      return;
    }

    void this.loadAndPlay(nextIndex);
  }

  private waitForCanPlay(): Promise<void> {
    if (this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('No se pudo cargar el audio'));
      };
      const cleanup = () => {
        this.audio.removeEventListener('canplay', onReady);
        this.audio.removeEventListener('error', onError);
      };

      this.audio.addEventListener('canplay', onReady, { once: true });
      this.audio.addEventListener('error', onError, { once: true });
    });
  }

  private async loadAndPlay(index: number): Promise<void> {
    const tracks = this.queue();
    const track = tracks[index];
    if (!track) return;

    const generation = ++this.loadGeneration;
    this.suppressEnded = true;
    this.isOpen.set(true);
    this.activeTrack.set(track);
    this.currentIndex.set(index);
    this.currentTime.set(0);
    this.duration.set(0);
    this.audio.pause();

    try {
      this.audio.src = track.url;
      this.audio.load();

      await this.waitForCanPlay();
      if (generation !== this.loadGeneration) return;

      await this.audio.play();
      if (generation !== this.loadGeneration) return;

      this.isPlaying.set(true);
    } catch {
      if (generation !== this.loadGeneration) return;
      this.isPlaying.set(false);
    } finally {
      if (generation === this.loadGeneration) {
        this.suppressEnded = false;
      }
    }
  }
}
