'use client'

import { useEffect, useRef, useState, forwardRef } from "react";
import dynamic from 'next/dynamic';
import { MeshPhongMaterial } from 'three';
// import * as d3 from 'd3';
import './globe.css';
import { useInViewport } from 'react-in-viewport';
import { useRouter } from "next/navigation";

const GlobeTmpl = dynamic(() => import('./GlobeWrapper'), {
    ssr: false
});

const Globe = forwardRef((props, ref) => (
    <GlobeTmpl {...props} forwardRef={ref} />
));

const handleVisibilityChange = (globeRef) => {
    if (globeRef.current) {
        globeRef.current.controls().autoRotate = !document.hidden
    }
}

export default function RenderGlobe({ initialGlobeData, width, height }) {
    const globeRef = useRef();
    const globeBoundsRef = useRef();
    const [globeData, setGlobeData] = useState(initialGlobeData);
    const [globeReady, setGlobeReady] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [hoverD, setHoverD] = useState();
    const globeMaterial = new MeshPhongMaterial();
    const router = useRouter();

    const { inViewport } = useInViewport(globeBoundsRef);

    // const useTempCursor = (enabled, cursor = 'default') => {
    //     let tempCursorStyleElement;
    //     if((tempCursorStyleElement = document.getElementById('temp-cursor-style')) != false) {
    //         tempCursorStyleElement = document.createElement('style');
    //         tempCursorStyleElement.setAttribute("id", "temp-cursor-style");
    //     }
    //     if (enabled) {
    //         tempCursorStyleElement.innerHTML = `* { cursor: ${cursor} !important}`;
    //     } else {
    //         tempCursorStyleElement.innerHTML = '';
    //     }
            
    // };

    const getElementByInnerHTML = (tag, content) => {
        const styles = document.querySelectorAll(tag);
        
        for (let i = 0; i < styles.length; i++) {
            if(styles[i].innerHTML = content) return styles[i];
        }
    }

    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = inViewport;
        }
    }, [inViewport])

    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = -1;
            globeRef.current.controls().enableZoom = false;
            globeRef.current.camera().up = { x: 0, y: 1, z: 0 };
        }
    }, [globeReady])

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange(globeRef))
    }, [])

    const toggleRotate = (value) => {
        globeRef.current.controls().autoRotate = value;
    }

    const handleClick = (polygon) => {
        if (polygon.properties.TotalOpportunities) {
            router.push(`https://operatiemobilisatie.vercel.app/gaan/long-term-opportunities?&country=${polygon.properties.ISO_A2}`)
        }
    }

    const handleHover = (polygon) => {
        setHoverD(polygon);
        if (polygon) toggleRotate(false)
        else toggleRotate(true)

        const container = document.querySelector('canvas[data-engine="three.js r161"');
        if(polygon && !polygon.properties.TotalOpportunities || !polygon) container.style.cursor = 'default';
        else container.style.cursor = 'pointer';
    }

    return (
        <div
            ref={globeBoundsRef}
            style={{ borderRadius: '100%' }}
        >
            <Globe
                ref={globeRef}
                width={width}
                height={height}
                globeMaterial={globeMaterial}
                onGlobeReady={() => setGlobeReady(true)}
                lineHoverPrecision={0}
                backgroundColor="#FFFFFF00"
                polygonsData={initialGlobeData}
                polygonCapColor={d => d === hoverD ? 'rgb(210, 38, 48)' : getCapColor(d.properties)}
                polygonAltitude={d => d === hoverD ? 0.05 : 0.03}
                polygonSideColor={d => d === hoverD ? '#ffffff' : '#ffffff00'}
                atmosphereColor="rgb(210, 38, 48)"
                polygonLabel={({ properties: d }) => countryInfo(d)}
                onPolygonHover={d => handleHover(d)}
                onPolygonClick={d => handleClick(d)}
                polygonsTransitionDuration={300}
            />
        </div>
    )

}

const getPercentageReached = (PercentReached) => {
    if (PercentReached > 0) {
        return `${Math.ceil(PercentReached)}%`
    } else {
        return "-"
    }
}

const getCapColor = (properties) => {
    if (properties.PercentReached !== null) {
        return `rgba(210, 38, 48, ${((100 - properties.PercentReached) / 100)})`;
    } else {
        return `rgba(141, 141, 143, ${(properties.GDP_MD / properties.POP_EST) + 0.1})`;
    }
}

const countryInfo = ({NAME_NL, GDP_MD, PercentReached, TotalOpportunities, TotalMissions}) => {
    return (
        `<div class="globe-card">
            <span class="country-name">${NAME_NL}</span>
            <span class="country-omers"><strong>OM'ers:</strong> ${GDP_MD}</span>
            ${(PercentReached > 0 ? `<span class="country-reached"><strong>Bereikt:</strong> ${getPercentageReached(PercentReached)}</span>` : '')}
            ${(TotalOpportunities ? `<span class="country-opportunities"><strong>Opportunities:</strong> ${TotalOpportunities}</span>` : '')}
            ${(TotalMissions ? `<span class="country-missions"><strong>Missions:</strong> ${TotalMissions}</span>` : '')}
        </div>`
    )
}