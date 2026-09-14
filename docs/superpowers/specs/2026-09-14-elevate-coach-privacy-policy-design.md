# Elevate Coach Privacy Policy Design

## Goal

Create a minimal, independently deployable privacy-policy website for Elevate Coach inside this repository without changing or exposing the existing Admin application.

## Architecture

The site will live at the repository root in `privacy-policy/`. It will be a framework-free static site consisting of `index.html` and `styles.css`. A `vercel.json` file will be added inside that folder only if verification shows Vercel needs explicit configuration; otherwise Vercel's static-file defaults will be used.

The Vercel project must use `privacy-policy` as its Root Directory. The project will not import files from `frontend/`, link to the Admin application, or share the Admin application's Vercel configuration.

## Content

The page will preserve the substantive wording and major sections of the existing TermsFeed privacy policy while:

- using “Elevate Coach” as the application name;
- retaining “Avihu Team” as the company name;
- changing the Last updated date to September 14, 2026;
- removing TermsFeed branding, generator notices, scripts, analytics, tracking, and page chrome;
- adding a dedicated Health and Fitness Data section that discloses Health Connect access to step count, distance traveled, calories burned, and related activity data;
- explaining the purposes, server/service-provider storage, prohibited uses, and user permission controls for Health Connect data.

The existing contact email address will remain unchanged.

## Presentation

The page will use semantic HTML and a separate stylesheet. The design will use a centered reading column, restrained typography and color, accessible link and focus treatments, comfortable spacing, and responsive rules suitable for mobile screens. It will contain no navigation, login, cookies, JavaScript, analytics, or unnecessary external requests.

## Verification

Verification will:

- serve `privacy-policy/` with a local static HTTP server and request the page and stylesheet;
- validate that the stylesheet reference resolves and every page link is intentional and valid;
- assert the expected title, current Last updated date, major policy headings, and complete Health and Fitness Data disclosure;
- assert that there are no scripts, trackers, TermsFeed branding, Admin URLs, or dependencies on files outside `privacy-policy/`;
- inspect Git status and diff to confirm no existing Admin application file or deployment configuration was changed.

## Deployment

The handoff will give the exact Vercel Root Directory, `privacy-policy`, and concise Dashboard deployment steps for creating a new Vercel project rather than modifying the existing Admin project.
