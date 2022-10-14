import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { ApolloLink, InMemoryCache, split } from 'apollo-boost';
import { persistCache } from 'apollo-cache-persist';
import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// apollo-cache-persist 패키지는 cache가 변경될때마다
// storage에 저장해주기 위해 사용한다.
const cache = new InMemoryCache();
persistCache({
    cache,
    // cache storage 설정
    // 현재는 localStorage를 사용한다.
    storage: localStorage
});

// 기존 cache가 존재할 경우 기존 cache를 불러온다.
if (localStorage['apollo-cache-persist']) {
    const cacheData = JSON.parse(localStorage['apollo-cache-persist']);
    cache.restore(cacheData);
}

// apollo-upload-client에서 제공하는 http 링크 사용
// 해당 링크는 파일업로드를 위한 multipart/form-data를 지원한다.
const httpLink = createUploadLink({ 
    uri: 'http://localhost:4000/graphql' 
});
// 각종 요청의 처리를 하기 위한 ApolloLink를 생성한다.
// authLink를 통해 사용자 권한 인증 처리를 한다.
const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(context => ({
        headers: {
            ...context.headers,
            authorization: localStorage.getItem('token')
        }
    }));
    return forward(operation);
})

// 링크는 자유롭게 구성될 수 있으며 각각이 별도로 구성되고 조합될 수 있다.
const httpAuthLink = authLink.concat(httpLink);

// 웹소켓 연결을 담당하기 위한 링크를 생성한다.
const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: { 
        reconnect: true 
    }
});
  
// split을 사용하여 일반 http 통신과 웹소켓 연결을 분리할 수 있다.
// query, mutation 요청은 httpAuthLink로 처리하고,
// subscription은 wsLink를 통해 처리한다.
const link = split(
    // 첫 번째 파라미터는 어떤 Link를 사용할지 결정하는 함수를 작성한다.
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    }, 
    // 첫 번째 함수가 반환하는 값이 true인경우 해당 Link를 사용한다.
    wsLink,
    // false인 경우는 해당 Link를 사용한다.
    httpAuthLink
);

// ApolloClient를 통해 react 컴포넌트 내부에서 graphql 쿼리를 요청할 수 있다.
const client = new ApolloClient({ cache, link });

render(
    // ApolloProvider를 감싸줌으로써 react context에서 apollo client를 사용할 수 있게 된다.
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>, 
    document.getElementById('root')
);