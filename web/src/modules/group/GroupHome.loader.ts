import { type LoaderFunctionArgs } from 'react-router-dom';
import groupService from './group.service';
import type { Page } from '@/model/Page';
import type { Playlist } from '@/model/Playlist';
import type { Music } from '@/model/Music';

export const PREVIEW_LIMIT = 5;

export type GroupHomeLoaderData = {
  musics: Promise<Page<Music>>;
  playlists: Promise<Page<Playlist>>;
};

export const loader = ({
  params,
}: LoaderFunctionArgs): GroupHomeLoaderData => {
  const id = Number(params.id);

  return {
    musics: groupService.getMusics(id, { page: 0, size: PREVIEW_LIMIT }),
    playlists: groupService.getPlaylists(id, { page: 0, size: PREVIEW_LIMIT, starred: true }),
  };
};