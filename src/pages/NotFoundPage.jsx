import { Link } from 'react-router';
export default function NotFoundPage(){return <section className="not-found"><div><span>404</span><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="btn btn-primary" to="/">Return home</Link></div></section>}
