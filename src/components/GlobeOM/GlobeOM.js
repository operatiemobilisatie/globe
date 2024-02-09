import RenderGlobe from './RenderGlobe';

const getJPData = async (JP_API_KEY) => {
  const res = await fetch(`https://api.joshuaproject.net/v1/countries.json?api_key=${JP_API_KEY}&limit=300`);
  const data = res.json();

  return data;
}

const getOpportunities = async () => {
  const res = await fetch(`https://api.operatiemobilisatie.nl/api/long-term-opportunities?fields=id&populate=country&pageSize=500`);
  const data = res.json();

  return data;
}

const getMissions = async () => {
  const res = await fetch(`https://api.operatiemobilisatie.nl/api/short-term-missions?fields=id&populate=country&pageSize=500`);
  const data = res.json();

  return data;
}

const setupGlobeData = async ({JP_API_KEY}) => {
  const geoData = require('./data/geo.json');
  const jpData = await getJPData(JP_API_KEY);
  const opportunities = await getOpportunities();
  const missions = await getMissions();

  const globeData = geoData.features.map((country) => {
    const jpCountry = jpData.find(({ISO2}) => ISO2 === country.properties.ISO_A2)
    country.properties.PercentReached = (jpCountry && jpCountry.PercentChristianity !== null ? jpCountry.PercentChristianity : null);
    country.properties.TotalOpportunities = (jpCountry ? opportunities.results.filter(({country}) => country.countryCode === jpCountry.ISO2).length : null)
    country.properties.TotalMissions = (jpCountry ? missions.results.filter(({country}) => country.countryCode === jpCountry.ISO2).length : null)
    country.enablePointerInteraction = true

    return country;
  });

  return globeData;
}

export default async function GlobeOM({JP_API_KEY, width, height}) {
  const initialGlobeData = await setupGlobeData({JP_API_KEY});

  return (
    <RenderGlobe initialGlobeData={initialGlobeData} width={width} height={height} />
  );  
}