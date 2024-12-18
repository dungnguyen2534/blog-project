## My First Fullstack App: A Blog Platform

I built my first fullstack app using NextJS and ExpressJS, a blog platform inspired by [DEV.TO](https://dev.to/).

### Features:

- **Authentication System**: Users can sign up via Google, GitHub, or email with verification.
- **User Profiles**: Users can upload avatars, edit their username, and bio.
- **Article Management**: Users can create and update articles using a markdown editor.
- **Comment System**: Fully functional with sub-comments, also using markdown.
- **Interactions**: Users can like articles and comments, follow other users and tags, bookmark articles.
- **Infinite Scrolling**: Articles load infinitely and can be filtered by latest, top (week/month/year/all-time), users/tags followed. There's also a separate page for bookmarks which supports search for articles and filter by tags.
- **SEO and Speed**: Static loading of article content for better SEO and faster page loading.
- **Responsive Design**: Built with Tailwind CSS and Shadcn/UI, supporting dark/light modes.
- **Client-Side Fetching/Validation**: Using SWR for data fetching with customized native fetch.
- **Image Optimization**: Users can upload images in both articles/comments, which are resized and converted to WebP for optimal size.
- **Data Input Validation**: Validation on both frontend and backend with Zod, rate limiting to prevent spam.
- **Session Management**: Sessions are stored with Redis for fast access.
- **And many other small features...**
