# Campus Carpool

Campus Carpool is a mobile application built with React Native to help university students share rides to campus.
The goal is to reduce commuting costs by enabling nearby student drivers to pick up students traveling to the same or to nearby universities.

## Problem

Ride-hailing services can be expensive for students who commute daily.
At the same time, many students already drive to campus with available seats in their cars.

## Solution

Campus Carpool focuses on community-driven ride sharing within a university context.
Students who are driving can offer rides to nearby students traveling to the same campus, helping reduce costs, traffic, and unnecessary trips.

## Features

- Home and Profile tabs with clean, minimal navigation
- Role-based profiles (Student and Driver) within a single user account
- Unified design system for consistent styling
- Scalable project structure using modern React Native patterns

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Supabase (Authentication and PostgreSQL database)

## Backend Approach

Supabase is used for authentication and database management, leveraging its built-in auth system and PostgreSQL database.

An Express backend may be introduced to handle custom business logic such as ride matching and validation, allowing the frontend to remain lightweight while keeping the overall architecture simple and maintainable.

## Project Status

This project is currently in early development and serves as a solid foundation for demonstrating mobile application architecture, navigation patterns, and full-stack design decisions in a portfolio setting.
