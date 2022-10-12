import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { persistCache } from 'apollo-cache-persist';

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
    let cacheData = JSON.parse(localStorage['apollo-cache-persist']);
    cache.restore(cacheData);
}

// ApolloClient를 통해 react 컴포넌트 내부에서 graphql 쿼리를 요청할 수 있다.
const client = new ApolloClient({ 
    cache,
    uri: 'http://localhost:4000/graphql', 
    request: operation => {
        // 매 요청마다 github 인증 토큰을 설정해준다.
        operation.setContext(context => ({
            headers: {
                ...context.headers,
                // localStorage에 저장해둔 github 인증 토큰을 가져온다.
                authorization: localStorage.getItem('token')
            }
        }))
    }
})

render(
    // ApolloProvider를 감싸줌으로써 react context에서 apollo client를 사용할 수 있게 된다.
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>, 
    document.getElementById('root')
)