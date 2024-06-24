import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { PostHogProvider } from 'posthog-js/react';
import DataDog from 'react-datadog';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import '_mockApis';

import App from 'App';
import { BASE_PATH } from 'config';
import { ConfigProvider } from 'contexts/ConfigContext';
import reportWebVitals from 'reportWebVitals';
import * as serviceWorker from 'serviceWorker';
import { store } from 'store';

import 'assets/scss/style.scss';
import { Environments } from './utils/enum';

const posthogOptions = {
  api_host: 'https://us.i.posthog.com'
};

const httpLink = createHttpLink({
  uri: `${window?.ENV?.REMOTE_FALCON_GATEWAY}/graphql`
});

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: false
  }),
  // defaultOptions,
  link: httpLink,
  connectToDevTools: window?.ENV?.HOST_ENV === Environments.LOCAL
});

// eslint-disable-next-line import/prefer-default-export
export function setGraphqlHeaders(serviceToken) {
  let authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers
    }
  }));
  if (serviceToken && serviceToken !== '') {
    authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${serviceToken}`
      }
    }));
  }
  client.setLink(authLink.concat(httpLink));
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <DataDog
    applicationId="bd3037df-6473-4ced-ae36-e7ab72461eab"
    clientToken={window?.ENV?.DATADOG_CLIENT_TOKEN}
    service="remote-falcon-ui"
    env={window?.ENV?.HOST_ENV}
    sessionReplayRecording
    trackUserInteractions
    enableExperimentalFeatures={['clickmap']}
  >
    <Provider store={store}>
      <ConfigProvider>
        <BrowserRouter basename={BASE_PATH}>
          <ApolloProvider client={client}>
            <PostHogProvider apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY} options={posthogOptions}>
              <App />
            </PostHogProvider>
          </ApolloProvider>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  </DataDog>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
