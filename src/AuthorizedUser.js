import { gql } from 'apollo-boost';
import React, { Component } from 'react';
import { compose, Mutation, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { ROOT_QUERY } from './App';
import Me from './Me';

const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code: String!, $clientID: String!, $clientSecret: String!) {
        githubAuth(code: $code, clientID: $clientID, clientSecret: $clientSecret) { token }
    }
`;

class AuthorizedUser extends Component {

    state = { signingIn: false };
    clientID = '';
    clientSecret = '';

    authorizationComplete = (cache, { data }) => {
        localStorage.setItem('token', data.githubAuth.token);
        this.props.history.replace('/');
        this.setState({ signingIn: false });
    }

    componentDidMount() {
        if (window.location.search.match(/code=/)) {
            this.setState({ signingIn: true });
            const code = window.location.search.replace("?code=", "");
            this.githubAuthMutation({ 
                variables: { 
                    code,
                    clientID: this.clientID,
                    clientSecret: this.clientSecret
                } 
            });
        }
    }

    logout = () => {
        localStorage.removeItem('token');
        let data = this.props.client.readQuery({ query: ROOT_QUERY });
        data.me = null;
        this.props.client.writeQuery({ query: ROOT_QUERY, data });
    }

    requestCode = (clientID, clientSecret) => {
        this.clientID = clientID;
        this.clientSecret = clientSecret;
        window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
    }

    render() {
        return (
            <Mutation mutation={GITHUB_AUTH_MUTATION}
                update={this.authorizationComplete}
                refetchQueries={[{ query: ROOT_QUERY }]}>
                {mutation => {
                    this.githubAuthMutation = mutation;

                    return (
                        <Me signingIn={this.state.signingIn}
                            requestCode={this.requestCode}
                            logout={this.logout} />
                    );
                }}
            </Mutation>

        )
    }
}

export default compose(withApollo, withRouter)(AuthorizedUser)   