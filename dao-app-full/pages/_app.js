import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from '../components/Navbar';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return ( <>  
    <Navbar/>
      <Head>
          <title>0xGamma DAO App</title>
          <meta name="description" content = "0xGamma"/>
      </Head>
    <Component {...pageProps} />
  </>
  )
}

export default MyApp
