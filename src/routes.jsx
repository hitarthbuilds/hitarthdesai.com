import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import { posts } from './content/posts';

function NotFound() {
  return (
    <main className="page">
      <Head>
        <title>Not found | Hitarth Desai</title>
        <meta name="robots" content="noindex" />
      </Head>
      <article className="page-inner">
        <h1 className="page-title">404</h1>
        <p className="page-lead">
          That page doesn’t exist. <Link to="/" className="link">Back home →</Link>
        </p>
      </article>
    </main>
  );
}

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <BlogIndex /> },
      {
        path: 'blog/:slug',
        element: <BlogPost />,
        // Enumerate which dynamic paths vite-react-ssg should prerender.
        getStaticPaths: () => posts.map((p) => `/blog/${p.slug}`),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];
