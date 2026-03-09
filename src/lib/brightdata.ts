export async function scrapeMontgomeryNews() {
    if (!process.env.BRIGHT_DATA_API_KEY) {
        throw new Error("Missing BRIGHT_DATA_API_KEY");
    }

    const response = await fetch(
        'https://api.brightdata.com/datasets/v3/trigger',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([
                { url: 'https://www.wsfa.com/news/local-news/' },
                { url: 'https://www.montgomeryadvertiser.com/news/montgomery/' }
            ])
        }
    );

    if (!response.ok) {
        throw new Error(`Bright Data API responded with ${response.status}`);
    }

    return response.json();
}
