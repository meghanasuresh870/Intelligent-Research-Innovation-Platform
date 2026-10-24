"""
Opportunity Service ΓÇô Module 6 Technology Intelligence

Detects innovation opportunity signals from technology data.

Signals are NOT guaranteed business opportunities.
They are data-driven indicators requiring expert judgment.

Signal types:
1. Adoption Gap        ΓÇö High research/patent growth + Low adoption
2. Growth Spike        ΓÇö Sudden large growth in a single year
3. Emerging Niche      ΓÇö Low competition + increasing research
4. Research Gap        ΓÇö Research growth without corresponding application diversity
5. Organization Surge  ΓÇö Rapidly increasing organization participation
6. Cross-Domain        ΓÇö Technology appearing across multiple domains
"""
from __future__ import annotations


OPPORTUNITY_TYPES = {
    "adoption_gap": "Adoption Gap",
    "growth_spike": "Research/Patent Growth Spike",
    "emerging_niche": "Emerging Niche",
    "research_gap": "Research-Application Gap",
    "org_surge": "Organization Surge",
}


def detect_opportunities(
    technology_id: str,
    technology_name: str,
    trend: dict,
    adoption: dict,
    indicators: dict,
) -> list[dict]:
    """
    Detect opportunity signals for a technology.

    Returns list of opportunity dicts ready to persist.
    """
    signals = []

    r_up = trend.get("research_direction") == "Increasing"
    p_up = trend.get("patent_direction") == "Increasing"
    r_growth = trend.get("research_growth") or 0
    p_growth = trend.get("patent_growth") or 0
    adoption_level = adoption.get("level", "Insufficient Data")
    adoption_trend = adoption.get("trend", "Insufficient Data")
    years = trend.get("years_analysed", 0)

    # ΓöÇΓöÇ Signal 1: Adoption Gap ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if r_up and p_up and adoption_level in ("Low", "Insufficient Data") and years >= 3:
        signals.append({
            "technology_id": technology_id,
            "opportunity_type": "Adoption Gap",
            "title": f"Adoption Gap Detected ΓÇö {technology_name}",
            "description": (
                f"Research activity is increasing ({r_growth:+.1f}% avg YoY) and "
                f"patent activity is increasing ({p_growth:+.1f}% avg YoY), "
                f"while adoption remains {adoption_level.lower()}. "
                "This may indicate an opportunity to bridge the research-to-deployment gap."
            ),
            "signals": [
                f"Research direction: Increasing ({r_growth:+.1f}% avg)",
                f"Patent direction: Increasing ({p_growth:+.1f}% avg)",
                f"Adoption level: {adoption_level}",
            ],
            "confidence": min(trend.get("confidence", 0.5) + 0.1, 0.95),
        })

    # ΓöÇΓöÇ Signal 2: Research/Patent Growth Spike ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    yearly_rg = trend.get("yearly_research_growth") or {}
    for year, data in yearly_rg.items():
        g = data.get("growth")
        if g is not None and g >= 100.0:
            signals.append({
                "technology_id": technology_id,
                "opportunity_type": "Research Growth Spike",
                "title": f"Research Growth Spike in {year} ΓÇö {technology_name}",
                "description": (
                    f"Research activity more than doubled in {year} "
                    f"({g:+.1f}% YoY growth). "
                    "This may indicate a significant breakthrough or increased interest."
                ),
                "signals": [f"Research growth {year}: {g:+.1f}%"],
                "confidence": 0.7,
            })
            break  # Report only the largest spike to avoid clutter

    # ΓöÇΓöÇ Signal 3: Research-Application Gap ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    diversity = indicators.get("diversity_score") or 0
    research_activity = indicators.get("research_activity_score") or 0
    if r_up and diversity < 40 and research_activity > 60:
        signals.append({
            "technology_id": technology_id,
            "opportunity_type": "Research-Application Gap",
            "title": f"Research Activity Outpaces Applications ΓÇö {technology_name}",
            "description": (
                "Research activity is high and growing, but application diversity "
                "is relatively narrow. This may indicate an opportunity to develop "
                "new application areas."
            ),
            "signals": [
                f"Research activity score: {research_activity:.0f}/100",
                f"Application diversity score: {diversity:.0f}/100",
                "Research direction: Increasing",
            ],
            "confidence": 0.65,
        })

    # ΓöÇΓöÇ Signal 4: Organization Surge ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    org_dir = trend.get("organization_direction")
    if org_dir == "Increasing" and years >= 3:
        org_score = indicators.get("organization_score") or 0
        if org_score >= 50:
            signals.append({
                "technology_id": technology_id,
                "opportunity_type": "Organization Surge",
                "title": f"Growing Organization Participation ΓÇö {technology_name}",
                "description": (
                    "The number of organizations contributing to this technology "
                    "is increasing, indicating broadening ecosystem participation."
                ),
                "signals": [
                    f"Organization participation score: {org_score:.0f}/100",
                    "Organization direction: Increasing",
                ],
                "confidence": 0.72,
            })

    return signals
