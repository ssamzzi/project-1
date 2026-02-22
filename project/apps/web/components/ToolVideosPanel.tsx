import { toolVideos } from '../lib/data/toolVideos';

export function ToolVideosPanel({ calculatorId, locale }: { calculatorId: string; locale: 'en' | 'ko' }) {
  const data = toolVideos[calculatorId];
  if (!data) return null;
  if (data.videos.length === 0 && (!data.extraLinks || data.extraLinks.length === 0)) return null;

  const title = locale === 'ko' ? '영상 자료' : 'Video Resources';
  const extraTitle = locale === 'ko' ? '추가 참고 링크' : 'Additional Reference Links';

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="space-y-2 text-sm">
        {data.videos.map((video) => (
          <li key={video.url}>
            <a href={video.url} target="_blank" rel="noreferrer" className="text-indigo-700 underline">
              {video.title}
            </a>
          </li>
        ))}
      </ul>
      {data.extraLinks?.length ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-slate-700">{extraTitle}</p>
          <ul className="space-y-1 text-xs">
            {data.extraLinks.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo-700 underline">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
