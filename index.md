---
layout: default
permalink: /
custom_heading: "Saivam"
title: "All Pages"
---

# Saivam

Classical Tamil poems, Shaiva devotional texts, and the Panchanga calculator.
All pages are listed below in alphabetical order.

<ul class="page-index">
{% assign indexed_pages = site.html_pages | sort: "title" %}
{% for p in indexed_pages %}
  {% if p.url != "/" and p.title %}
  <li>
    <a href="{{ p.url | relative_url }}">{{ p.title }}</a>
    {% if p.custom_heading and p.custom_heading != p.title %}
    <span class="page-index-native">{{ p.custom_heading }}</span>
    {% endif %}
  </li>
  {% endif %}
{% endfor %}
</ul>

<style>
  .page-index {
    list-style: none;
    padding: 0;
    margin: 24px 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 4px 24px;
  }

  .page-index li {
    padding: 10px 12px;
    border-bottom: 1px solid #eaecef;
  }

  .page-index a {
    font-weight: 600;
    text-decoration: none;
  }

  .page-index a:hover,
  .page-index a:focus {
    text-decoration: underline;
  }

  .page-index-native {
    display: block;
    font-size: 13px;
    color: #586069;
    margin-top: 2px;
  }
</style>
