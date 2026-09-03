import { Project } from '../types';
import { getProjectSlug } from './projectSlug';

const BASE_URL = 'https://nrnworld.one';
const DEFAULT_TITLE = 'nRnWorld - Project Hub & Direct Downloads';
const DEFAULT_DESC =
  'Official software repository and direct downloads hub for Windows utilities, AI agents, audio engines, and tools created by nRnWorld (@nRn-World).';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

function setMetaTag(attribute: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function updatePageSeo(project: Project | null) {
  if (typeof document === 'undefined') return;

  if (project) {
    const slug = getProjectSlug(project);
    const url = `${BASE_URL}/${slug}`;
    const title = `${project.name} – Direct Download & Details | nRnWorld`;
    const desc = `${project.tagline || project.description} Download official releases, explore specs, and view changelogs on nRnWorld.`;

    document.title = title;
    setCanonical(url);
    setMetaTag('name', 'description', desc);

    // OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:image', DEFAULT_IMAGE);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);
  } else {
    document.title = DEFAULT_TITLE;
    setCanonical(BASE_URL + '/');
    setMetaTag('name', 'description', DEFAULT_DESC);

    // OpenGraph
    setMetaTag('property', 'og:title', DEFAULT_TITLE);
    setMetaTag('property', 'og:description', DEFAULT_DESC);
    setMetaTag('property', 'og:url', BASE_URL + '/');
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:image', DEFAULT_IMAGE);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
    setMetaTag('name', 'twitter:description', DEFAULT_DESC);
    setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);
  }
}
