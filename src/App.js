import React from 'react';
import Users from './Users';
import { BrowserRouter } from 'react-router-dom';
import AuthorizedUser from './AuthorizedUser';
import { gql } from 'apollo-boost';

// 하위 컴포넌트에서 사용하게 될 쿼리
export const ROOT_QUERY = gql`
    query allUsers {
        totalUsers        
        allUsers { ...userInfo }
        me { ...userInfo }
    }

    # user 필드를 정의하기 위한 fragment 생성
    fragment userInfo on User {
        githubLogin
        name
        avatar
    }
`;

const App = () =>
    <BrowserRouter>
        <div>
            <AuthorizedUser />
            <Users />
        </div>
    </BrowserRouter>

export default App;