const MyApp = ({ Component, ...props }) => {
  return <Component {...props} />
}

MyApp.getInitialProps = async ({ ctx }) => {

  let props;

  if (!ctx.req || !ctx.res) {
    let path = ctx.asPath;

    props = await (await fetch('/api' + path)).json()
  } else {

    //res.setHeader('Cache-Control', 'max-age=10, public')
    let path = ctx.req.url;

    const req = await fetch('http://localhost' + '/api' + path, {
      headers: ctx.req.headers
  });
    props = await req.json();

    /**
     * This is where the magic happens with our caddy cache
     * 
     * We pass the caching headers from the backend along to the rendered frontend
     * which allows us to then invalidate both front and backends at the same time
     * depending on which surrogate keys are indexed
     */

    const cacheKey = props.cache?.surrogate_key;

    if (cacheKey) {
      ctx.res.setHeader('Surrogate-Key', cacheKey.replace('/', ''))
      ctx.res.setHeader('Cache-Control', req.headers.get('cache-control'))
    }

  }

  return {
    apiProps: props
  };
}

export default MyApp
