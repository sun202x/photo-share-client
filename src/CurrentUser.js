import React from 'react';
import { NavLink } from 'react-router-dom';

const CurrentUser = ({ name, avatar, logout }) =>
    <div>
        <img src={avatar} width={48} height={48} alt="" />
        <h1>{name}</h1>
        <button onClick={logout}>logout</button>
        <NavLink to="/newPhoto">Post Photo</NavLink>
    </div>

export default CurrentUser;