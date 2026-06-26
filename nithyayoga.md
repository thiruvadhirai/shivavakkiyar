---
layout: default
title: Nithya Yoga - The 27 Daily Yogas
permalink: /nithyayoga/
---

# Nithya Yoga (Auspiciousness)

**Nithya Yoga** (नित्ययोग), the "daily yoga", is one of the five limbs of the
Hindu panchangam. It is calculated from the **sum** of the Sun's and Moon's
sidereal longitudes, divided into **27** equal parts of 13°20′ each. The
panchangam "Yoga" you see in the [calculator](/panchangam/) refers to this
Nithya Yoga.

> **Note:** Nithya Yoga is distinct from the broader category of *yogas* in
> Jyotisha (Vedic astrology) — planetary combinations such as Raja Yoga, Dhana
> Yoga and the Pancha Mahapurusha Yogas, of which there are **well over a
> hundred**. Only the *Nithya* (daily) yogas number 27.

Of the 27 Nithya Yogas, nine are traditionally considered **inauspicious**
(Vishkambha, Atiganda, Shoola, Ganda, Vyaghaata, Vajra, Vyatipaata, Parigha and
Vaidhriti); the remaining eighteen are considered **auspicious**.

## The 27 Nithya Yogas

| # | Yoga | Tamil | Meaning | Nature | Description |
|---|------|-------|---------|--------|-------------|
{% for y in site.data.nithya_yoga -%}
| {{ y.number }} | {{ y.name }} | {{ y.tamil }} | {{ y.meaning }} | {{ y.nature | capitalize }} | {{ y.description }} |
{% endfor %}

---

*Each Nithya Yoga lasts roughly one day, but its exact start and end depend on
the varying speeds of the Sun and Moon. Use the
[Panchangam Calculator](/panchangam/) to find the active Nithya Yoga and its
end-time for any date and location.*
