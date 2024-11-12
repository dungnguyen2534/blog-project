## My First Fullstack App: A Blog Platform

I built my first fullstack app using NextJS for the frontend and ExpressJS for the backend. It’s a blog app inspired by [DEV.TO](dev.to).

### Features:

- **Authentication System**: Users can sign up via Google, GitHub, or email with verification.
- **User Profiles**: Users can upload avatars, edit their username, and bio.
- **Article Management**: Users can create and update articles using a markdown editor.
- **Comment System**: Fully functional with sub-comments, also using markdown.
- **Interactions**: Users can like articles and comments, follow other users and tags.
- **Infinite Scrolling**: Articles load infinitely and can be filtered by latest, top (week/month/year/all-time), and by users/tags followed.
- **SEO and Speed**: Static loading of article content for better SEO and faster page loading.
- **Responsive Design**: Built with Tailwind CSS and Shadcn/UI, supporting dark/light modes.
- **Client-Side Revalidation**: Using SWR for data fetching with customized native fetch.
- **Image Optimization**: Users can upload images in both articles/comments, which are resized and converted to WebP for optimal size.
- **Data Validation**: Validation on both frontend and backend, with rate limiting to prevent spam.
- **Session Management**: Sessions are stored with Redis for fast access.
- **And many other small details...**
  
This project isn’t finished and still lacks some features. There might be bad code, bad practices, and hidden bugs, but it’s taken quite a bit of time. I’m still learning, and I want to explore new things, so I’ll leave it for now. I’ll come back later to refactor if needed and add more features.
