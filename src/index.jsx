import React from 'react';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { MultiAPILink } from '@habx/apollo-multi-endpoint-link';
import mixpanel from 'mixpanel-browser';
import { PostHogProvider } from 'posthog-js/react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { BASE_PATH } from './config';
import { ConfigProvider } from './contexts/ConfigContext';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { store } from './store';

import './assets/scss/style.scss';
import { Environments } from './utils/enum';

if (import.meta.env.VITE_MIXPANEL_KEY) {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY);
} else {
  mixpanel.init('*');
  mixpanel.disable();
}

const posthogOptions = {
  api_host: 'https://us.i.posthog.com'
};

const link = ApolloLink.from([
  new MultiAPILink({
    endpoints: {
      controlPanel: import.meta.env.VITE_CONTROL_PANEL_API,
      viewer: import.meta.env.VITE_VIEWER_API
    },
    createHttpLink: () => createHttpLink()
  })
]);

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: false
  }),
  // defaultOptions,
  link,
  connectToDevTools: import.meta.env.VITE_HOST_ENV === Environments.LOCAL
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
  client.setLink(authLink.concat(link));
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ConfigProvider>
      <BrowserRouter basename={BASE_PATH}>
        <ApolloProvider client={client}>
          <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={posthogOptions}>
            <App />
          </PostHogProvider>
        </ApolloProvider>
      </BrowserRouter>
    </ConfigProvider>
  </Provider>,
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
