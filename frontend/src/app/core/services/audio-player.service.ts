import { Injectable, computed, signal } from '@angular/core';

export interface PlaybackTrack {
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

type RepeatMode = 'off' | 'all' | 'one';

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly audio = new Audio();

  readonly queue = signal<PlaybackTrack[]>([]);
  readonly currentIndex = signal(-1);
  readonly isPlaying = signal(false);
  readonly shuffle = signal(false);
  readonly repeatMode = signal<RepeatMode>('off');
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly currentTrack = computed(() => {
    const index = this.currentIndex();
    const tracks = this.queue();
    return index >= 0 && index < tracks.length ? tracks[index] : null;
  });

  readonly hasActivePlayer = computed(() => this.currentTrack() !== null);

  readonly progress = computed(() => {
    const duration = this.duration();
    if (!duration) return 0;
    return (this.currentTime() / duration) * 100;
  });

  constructor() {
    this.audio.preload = 'none';

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
    this.queue.set(tracks);
    void this.loadAndPlay(startIndex);
  }

  playSingle(track: PlaybackTrack): void {
    this.playTracks([track], 0);
  }

  togglePlay(): void {
    if (!this.currentTrack()) return;
    if (this.audio.paused) {
      void this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  next(): void {
    const tracks = this.queue();
    if (!tracks.length) return;

    if (this.repeatMode() === 'one') {
      this.audio.currentTime = 0;
      void this.audio.play();
      return;
    }

    let nextIndex = this.currentIndex() + 1;

    if (this.shuffle()) {
      if (tracks.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * tracks.length);
        } while (nextIndex === this.currentIndex());
      }
    }

    if (nextIndex >= tracks.length) {
      if (this.repeatMode() === 'all') {
        nextIndex = 0;
      } else {
        this.stop();
        return;
      }
    }

    void this.loadAndPlay(nextIndex);
  }

  previous(): void {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    const tracks = this.queue();
    if (!tracks.length) return;

    let prevIndex = this.currentIndex() - 1;
    if (prevIndex < 0) {
      prevIndex = this.repeatMode() === 'all' ? tracks.length - 1 : 0;
    }

    void this.loadAndPlay(prevIndex);
  }

  toggleShuffle(): void {
    this.shuffle.update((value) => !value);
  }

  cycleRepeat(): void {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    const current = this.repeatMode();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.repeatMode.set(next);
  }

  seekByPercent(percent: number): void {
    if (!Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = (percent / 100) * this.audio.duration;
  }

  stop(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.isPlaying.set(false);
    this.currentIndex.set(-1);
    this.currentTime.set(0);
    this.duration.set(0);
  }

  isCurrentTrack(id: number): boolean {
    return this.currentTrack()?.id === id;
  }

  private onTrackEnded(): void {
    if (this.repeatMode() === 'one') {
      this.audio.currentTime = 0;
      void this.audio.play();
      return;
    }
    this.next();
  }

  private async loadAndPlay(index: number): Promise<void> {
    const track = this.queue()[index];
    if (!track) return;

    this.currentIndex.set(index);
    this.currentTime.set(0);
    this.duration.set(0);
    this.audio.src = track.url;
    this.audio.load();

    try {
      await this.audio.play();
    } catch {
      this.isPlaying.set(false);
    }
  }
}
