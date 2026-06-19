import { Composition } from '../../models/index.js';
import { listWorks, listInterpretations } from '../catalog/catalog.service.js';
import { resolveUserProfiles } from '../auth/auth.service.js';

export async function getDashboardData(user) {
  const context = await resolveUserProfiles(user.id_user);
  const isAdmin = !!user.is_admin;

  const composerProfile = context.profiles.find((p) => p.type === 'composer');
  const directorProfile = context.profiles.find((p) => p.type === 'director');
  const artistProfile = context.profiles.find((p) => p.type === 'artist');

  if (isAdmin) {
    const [works, interpretations] = await Promise.all([listWorks(), listInterpretations()]);
    return {
      scope: 'admin',
      works,
      interpretations,
      showWorks: true,
      showInterpretations: true,
    };
  }

  let works = [];
  let interpretations = [];

  if (composerProfile) {
    const links = await Composition.findAll({
      where: { id_composer: composerProfile.id },
      attributes: ['id_work'],
    });
    const workIds = [...new Set(links.map((link) => link.id_work))];

    if (workIds.length) {
      const allWorks = await listWorks();
      works = allWorks.filter((work) => workIds.includes(work.id_work));
    }
  }

  if (directorProfile) {
    interpretations = await listInterpretations({ directorId: directorProfile.id });
  } else if (artistProfile) {
    interpretations = await listInterpretations({ artistId: artistProfile.id });
  }

  return {
    scope: 'personal',
    works,
    interpretations,
    showWorks: !!composerProfile,
    showInterpretations: !!(directorProfile || artistProfile),
  };
}
