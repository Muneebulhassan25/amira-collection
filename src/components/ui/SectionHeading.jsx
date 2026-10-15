export default function SectionHeading({ eyebrow, title, link, linkText = 'View all' }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{link && <a className="text-button" href={link}>{linkText}<span aria-hidden="true"> ↗</span></a>}</div>;
}
