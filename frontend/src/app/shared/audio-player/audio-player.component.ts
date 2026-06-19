import { Component, inject } from '@angular/core';
import { AudioPlayerService, PlaybackTrack } from '../../core/services/audio-player.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
})
export class AudioPlayerComponent {
  readonly player = inject(AudioPlayerService);

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.seekByPercent(Number(input.value));
  }

  onPlayTrack(track: PlaybackTrack, index: number): void {
    if (this.player.isOpen() && this.player.queue().length > 0) {
      if (this.player.isCurrentTrack(track.id)) {
        this.player.togglePlay();
        return;
      }
      this.player.playAtIndex(index);
      return;
    }

    this.player.playTracks(this.player.playlist(), index);
  }
}
