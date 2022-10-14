import React, { Component, Fragment } from 'react';
import Users from './Users';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AuthorizedUser from './AuthorizedUser';
import Photos from './Photos';
import PostPhoto from './PostPhoto';
import { gql } from 'apollo-boost';
import { withApollo } from 'react-apollo';

// 기본 정보들을 불러오기 위한 쿼리
// gql은 graphQL 쿼리를 AST 형식으로 만들어 반환한다.
export const ROOT_QUERY = gql`
    query allUsers {
        totalUsers  
        totalPhotos  
        # 추가된 모든 사용자 정보
        allUsers { ...userInfo }
        # 현재 접속한 사용자 정보
        me { ...userInfo }
        # 화면 로딩시 보여줄 모든 사진들을 받는 필드
        allPhotos {
            id
            name
            url
        }
    }

    # userInfo 필드 공통처리를 위한 fragment 생성
    fragment userInfo on User {
        githubLogin
        name
        avatar
    }
`;

// subscription 쿼리 작성
const LISTEN_FOR_USERS = gql`
    subscription {
        newUser {
            githubLogin
            name
            avatar
        }
    }
`;
const LISTEN_FOR_PHOTOS = gql`
    subscription {
        newPhoto {
            id
            name
            url
        }
    }
`;

class App extends Component {

    componentDidMount() {
        const { client } = this.props;

        // ApolloClient를 통해 subscription을 등록한다.
        this.listenForUsers = client
            // subscription의 쿼리를 등록한다.
            .subscribe({ query: LISTEN_FOR_USERS })
            // observer 객체의 subscription 함수를 통해 구독한다.
            .subscribe(({ data: { newUser } }) => {
                const data = client.readQuery({ query: ROOT_QUERY });

                data.totalUsers += 1;
                data.allUsers = [
                    ...data.allUsers,
                    newUser
                ];
                // 갱신된 정보를 ApolloCache에 바로 전달
                client.writeQuery({ query: ROOT_QUERY, data });
            });
        this.listenForPhotos = client
            .subscribe({ query: LISTEN_FOR_PHOTOS })
            .subscribe(({ data: { newPhoto } }) => {
                const data = client.readQuery({ query: ROOT_QUERY });

                data.totalPhotos += 1;
                data.allPhotos = [
                    ...data.allPhotos,
                    newPhoto
                ];
                client.writeQuery({ query: ROOT_QUERY, data });
            });
    }

    componentWillUnmount() {
        // observer 객체의 unsubscribe 함수를 통해 컴포넌트 제거시 구독해제가 가능하다.
        this.listenForUsers.unsubscribe();
        this.listenForPhotos.unsubscribe();
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() =>
                        <Fragment>
                            <AuthorizedUser />
                            <Users />
                            <Photos />
                        </Fragment>
                    } />
                    <Route path="/newPhoto" component={PostPhoto} />
                    <Route component={({ location }) => <h1>"{location.pathname}" not found</h1>} />
                </Switch>
            </BrowserRouter>
        )
    }
}


export default withApollo(App);