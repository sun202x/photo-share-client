import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { ROOT_QUERY } from './App';
import CurrentUser from './CurrentUser';

class Me extends Component {

    state = {
        id: '',
        secret: ''
    };

    onChange = (event) => {
        if (event.target.id === 'id') {
            this.setState({
                id: event.target.value
            });
        } else {
            this.setState({
                secret: event.target.value
            });
        }
    }

    onClick = () => {
        const { id, secret } = this.state;
        this.props.requestCode(id, secret);
    }

    render() {
        const { id, secret } = this.state;

        return (
            <Query query={ROOT_QUERY} fetchPolicy="cache-only">
                {({ loading, data }) => data.me 
                    ? <CurrentUser {...data.me} logout={this.props.logout} /> 
                    : loading 
                        ? <p>loading... </p> 
                        : (
                            <div>
                                <span>clientId</span>
                                <input id="id" onChange={this.onChange} value={id}></input>
                                <span>clientSecret</span>
                                <input id="secret" onChange={this.onChange} value={secret}></input>
                                <button onClick={this.onClick}
                                    disabled={this.props.signingIn}>
                                    Sign In with Github
                                </button>
                            </div>
                        )
                }
            </Query>
        );
    }
}

export default Me;