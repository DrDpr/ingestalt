---
id: itinerary_standards
title: Foodie Itinerary Blueprints
type: standards
color: '#a855f7'
icon: BookOpen
tags: [standards, configuration, foodie, travel]
definitions:
  - id: foodie_city
    type: Gourmet City
    icon: Globe
    color: '#3b82f6'
    fields:
      - name: stay_duration
        type: text
        icon: Calendar
        color: '#3b82f6'
      - name: main_station
        type: text
        icon: Train
        color: '#f59e0b'
      - name: travel_passes
        type: text
        icon: CreditCard
        color: '#10b981'

  - id: foodie_activity
    type: Foodie Activity
    icon: Utensils
    color: '#10b981'
    fields:
      - name: budget
        type: text
        icon: DollarSign
        color: '#f59e0b'
      - name: status
        type: text
        icon: AlertCircle
        color: '#ef4444'
      - name: logistics
        type: text
        icon: MapPin
        color: '#3b82f6'
---

# Foodie Travel Itinerary Blueprints

This blueprint defines the official dynamic metadata schemas and parameters for cities and foodie activities in the itinerary mapping project.

## Dynamic Fields Defined:
* **Gourmet City (`foodie_city`):** Manages stay duration, primary rail hubs, and transit pass details.
* **Foodie Activity (`foodie_activity`):** Enforces budget caps, reservation verification statuses, and step-by-step culinary logistics.
