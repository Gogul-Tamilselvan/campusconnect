# CampusConnect - Developer Documentation

This document provides a comprehensive, developer-focused overview of the CampusConnect web application. It covers the project's architecture, technology stack, core concepts, and a guide to its key features.

---

## 1. Project Overview & Technology Stack

CampusConnect is a modern, role-based campus management system designed to serve three main user types: **Students**, **Teachers**, and **Administrators**. Each role has a unique dashboard and a specific set of permissions tailored to their needs, creating a centralized platform for all campus-related activities.

### Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) (using the App Router for server-centric routing and rendering)
-   **UI Language:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for type safety and improved developer experience.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first styling approach.
-   **UI Components:** [ShadCN/UI](https://ui.shadcn.com/) for a set of high-quality, accessible, and customizable React components.
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (using Firestore for the database and Firebase Authentication for user management).
-   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) for integrating AI-powered features.

---

## 2. Core Concepts & Architecture

### 2.1. File & Folder Structure

The project is organized to be scalable and easy to navigate:

-   `src/app/`: This is the heart of the Next.js application, containing all routes (pages) and layouts.
    -   `src/app/login/page.tsx`: The unified authentication page for both login and signup.
    -   `src/app/dashboard/`: Contains all the pages and the main layout for the logged-in user experience. Each sub-folder represents a different feature (e.g., `attendance`, `blog`, `users`).
-   `src/components/`: Contains reusable React components.
    -   `src/components/ui/`: Holds the ShadCN UI components (Button, Card, Input, etc.).
    -   `src/components/auth-provider.tsx`: A crucial component that wraps the app to provide authentication state.
    -   `src/components/user-nav.tsx`: The user profile dropdown in the header.
-   `src/firebase/`: All Firebase-related setup and hooks are centralized here.
    -   `provider.tsx`: Initializes and provides the Firebase app instance to the entire application.
    -   `firestore/`: Contains custom hooks like `useCollection` and `useDoc` for easy data fetching from Firestore.
    -   `errors.ts` & `error-emitter.ts`: A custom system for handling and displaying detailed Firestore security rule errors during development.
-   `src/hooks/`: Contains custom React hooks.
    -   `use-auth.tsx`: The primary hook for accessing user information and authentication functions (login, logout, signup).
-   `src/ai/`: Contains all the Genkit-related code for AI features.
    -   `flows/`: Holds the AI "flows," which are server-side functions that interact with generative models.
-   `src/lib/`: Contains utility functions, type definitions, and other shared logic.

### 2.2. Authentication Flow

Authentication is managed entirely by **Firebase Authentication**.

1.  **Login/Signup Page (`/login`):** A single page handles both login and signup using a tabbed interface. This provides a modern, seamless experience for the user.
2.  **`useAuth` Hook:** This is the central point for all authentication logic (`src/hooks/use-auth.tsx`). It provides `login`, `logout`, and `signup` functions that interact directly with the Firebase Authentication service.
3.  **`AuthProvider` Component:** This component (`src/components/auth-provider.tsx`) wraps the entire application. It listens for authentication state changes from Firebase. When a user logs in, it fetches their detailed profile (including their `role`) from the `users` collection in Firestore and makes it available globally via the `useAuth` hook.
4.  **`users` Collection (Firestore):** When a user signs up, a new document is created in the `/users/{userId}` collection in Firestore. This document stores their name, email, role (`Student`, `Teacher`, or `Admin`), and other profile information.
5.  **Dashboard Access & Route Protection:** The main dashboard layout (`src/app/dashboard/layout.tsx`) uses the `useAuth` hook to protect routes. If a user is not logged in, they are automatically redirected to the `/login` page, ensuring only authenticated users can access the dashboard.

### 2.3. Role-Based Access Control (RBAC)

The application's UI and functionality adapt based on the logged-in user's role.

-   **How it Works:** The `useAuth` hook provides the `user` object, which contains a `role` property (e.g., `user.role === 'Admin'`). Components throughout the application use this property to conditionally render UI elements or enable/disable functionality.
-   **Implementation Examples:**
    -   **Navigation:** The main sidebar in `dashboard/layout.tsx` defines different navigation links for each role. An Admin sees links for "Manage Users" and "Academics," which are hidden from Students and Teachers.
    -   **Feature Access:** Individual pages check the user's role to control actions. For instance, the "Create Poll" button on the `/dashboard/polls` page is only rendered if `user.role` is 'Admin' or 'Teacher'.

### 2.4. Data Management with Firestore

All application data (users, blog posts, events, etc.) is stored in **Firestore**, a flexible, scalable NoSQL database.

-   **`useCollection` Hook (`src/firebase/firestore/use-collection.tsx`):** This is a custom hook used extensively throughout the app to fetch and listen to real-time updates from a Firestore collection. It simplifies data fetching, loading state management, and error handling. For example, `src/app/dashboard/announcements/page.tsx` uses it to get and display all announcements as they are created.
-   **Data Structure:** Firestore is organized into top-level collections like `users`, `announcements`, `events`, `blogPosts`, `timetables`, and `polls`. This flat structure makes the data easy to query and secure with Firestore Security Rules.
-   **Data Mutations:** Adding or updating data is done using standard Firebase SDK functions like `addDoc`, `updateDoc`, and `setDoc`. This pattern is visible in forms across the application, such as the "Add Event" or "Post Announcement" dialogs.

### 2.5. AI-Powered Features with Genkit

The app uses **Firebase Genkit** to integrate generative AI for creating helpful and intelligent features.

-   **Example: AI Event Suggestions (`/dashboard/events`):**
    1.  A Teacher or Admin enters an event name and optional details.
    2.  The form calls a **Next.js Server Action** (`getEventSuggestions` in `actions.ts`).
    3.  This action invokes the `suggestEventDetails` Genkit flow located in `src/ai/flows/suggest-event-details.ts`.
    4.  The flow sends a structured prompt to a Google AI model (Gemini), asking it to generate a clear event description and relevant category suggestions based on the user's input.
    5.  The AI's structured response is returned to the form and displayed to the user, who can then use the suggestions to create the event with a single click.

---

## 3. Guide to Key Pages & Features

This section provides a detailed look at each of the primary pages within the `dashboard`.

-   **Dashboard (`/dashboard`):** A landing page with role-specific summary cards.
    -   **Admin:** Sees high-level metrics like total student count, total teacher count, pending blog posts, and active events.
    -   **Teacher:** Views their number of scheduled classes for the day and total announcements posted.
    -   **Student:** Sees their overall attendance percentage and the number of new announcements and upcoming events.

-   **Academics (`/dashboard/academics`):** (Admin-only)
    -   **Functionality:** Allows Admins to manage core academic structures: **Departments** and **Semesters**.
    -   **Impact:** The data created here is used in dropdowns across the app, ensuring consistency (e.g., during student signup or when creating timetables).

-   **Announcements (`/dashboard/announcements`):**
    -   **Functionality:** Admins and Teachers can post announcements, which are displayed to all users in a chronological list.

-   **Attendance (`/dashboard/attendance`):**
    -   **Students:** Can view their attendance history across all subjects and see their unique QR code for check-ins.
    -   **Teachers:** Can take attendance by selecting a class and using their device's camera to scan student QR codes. They can also manually mark remaining students as absent after a session.
    -   **Admins:** Have a comprehensive, filterable view of all attendance records for every student and class.

-   **Blog (`/dashboard/blog`):**
    -   **Functionality:** Any user can write and submit a blog post, which enters a "Pending" state. Admins have access to an "Approval Queue" tab where they can review submitted posts and either "Approve" (publish to all users) or "Reject" (delete).

-   **Events (`/dashboard/events`):**
    -   **Functionality:** Teachers and Admins can create events. The form includes the AI suggestion feature to help generate clear descriptions and categories. All users can view the list of upcoming events.

-   **User Management (`/dashboard/users`):** (Admin-only)
    -   **Functionality:** A powerful table for viewing all users in the system. Admins can click an "Edit" button on any row, which opens a dialog to change a user's name, role, department, or semester. Changes are saved directly to Firestore.

-   **Polls & Surveys (`/dashboard/polls`):**
    -   **Functionality:** Teachers and Admins can create polls with multiple-choice options. Students can vote on active polls. After voting, the user sees the live results, including vote counts and percentages for each option.

-   **Profile & Settings (`/dashboard/profile`, `/dashboard/settings`):**
    -   **Functionality:** All users can update their profile information (name, department, semester). The settings page is a placeholder for future features like password changes or theme customization.

-   **Timetable (`/dashboard/timetable`):**
    -   **Functionality:** Admins can create and manage the weekly timetable for all departments and semesters. Students and Teachers see a filtered view relevant to their schedule.

-   **Study Materials (`/dashboard/materials`):**
    -   **Functionality:** Teachers and Admins can upload study materials (PDFs, documents, etc.) and categorize them by subject. Students can browse and download these materials, which are organized into expandable accordion sections for each subject.
