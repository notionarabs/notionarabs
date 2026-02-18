/**
 * Shared layout for all widget embed pages.
 * Injects the oEmbed discovery <link> tag so Notion and other platforms
 * automatically recognize these pages as embeddable iframes.
 */
export const metadata = {
    title: 'Notion Arabs Widget',
    description: 'Embeddable widget by Notion Arabs',
    // oEmbed discovery — platforms like Notion read this to know the page is embeddable
    alternates: {
        types: {
            'application/json+oembed': 'https://www.notionarabs.com/api/oembed',
        },
    },
};

export default function WidgetEmbedLayout({ children }) {
    return children;
}
