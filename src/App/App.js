import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

import connection from '../helpers/data/connection';

import Auth from '../components/Auth/Auth';
import Listings from '../components/Listings/Listings';
import MyNavbar from '../components/MyNavbar/MyNavbar';
import Building from '../components/Building/Building';
import ListingForm from '../components/ListingForm/ListingForm';

import listingRequests from '../helpers/data/listingRequests';

import './App.scss';
import authRequests from '../helpers/data/authRequests';

class App extends Component {
  state = {
    authed: false,
    listings: [],
    isEditing: false,
    editId: '-1',
    selectedListing: '-1',
  }

  listingSelectEvent = (id) => {
    this.setState({
      selectedListingId: id,
    });
  }

  componentDidMount() {
    connection();

    listingRequests.getRequest()
      .then((listings) => {
        this.setState({ listings });
      })
      .catch((err) => {
        console.error('error with listing GET', err);
      });

    this.removeListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: true,
        });
      } else {
        this.setState({
          authed: false,
        });
      }
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  isAuthenticated = () => {
    this.setState({ authed: true });
  }

  deleteOne = (listingId) => {
    listingRequests.deleteListing(listingId)
      .then(() => {
        listingRequests.getRequest()
          .then((listings) => {
            this.setState({ listings });
          });
      })
      .catch(err => console.error('error with delete single', err));
  }

  passListingToEdit = listingId => this.setState({ isEditing: true, editId: listingId });

  formSubmitEvent = (newListing) => {
    const { isEditing, editId } = this.state;
    if (isEditing) {
      listingRequests.putRequest(editId, newListing)
        .then(() => {
          listingRequests.getRequest()
            .then((listings) => {
              this.setState({ listings, isEditing: false, editId: '-1' });
            });
        }).catch((err) => {
          console.error('error with listings post', err);
        });
    } else {
      listingRequests.postRequest(newListing)
        .then(() => {
          listingRequests.getRequest()
            .then((listings) => {
              this.setState({ listings });
            });
        }).catch((err) => {
          console.error('error with listings post', err);
        });
    }
  }

  render() {
    const {
      authed,
      listings,
      isEditing,
      editId,
      selectedListingId,
    } = this.state;

    const selectedListing = listings.find(listing => listing.id === selectedListingId) || { nope: 'nope' };

    const logoutClickEvent = () => {
      authRequests.logOutUser();
      this.setState({ authed: false });
    };

    if (!authed) {
      return (
       <div className="App">
        <MyNavbar isAuthed={authed} logoutClickEvent={logoutClickEvent} />
        <div className="row">
          <Auth isAuthenticated={this.isAuthenticated}/>
        </div>
      </div>
      );
    }
    return (
      <div className="App">
        <MyNavbar isAuthed={ authed } logoutClickEvent={logoutClickEvent} />
        <div className="row">
          <Listings
          listings={listings}
          deleteSingleListing={this.deleteOne}
          passListingToEdit={this.passListingToEdit}
          onListingSelection={this.listingSelectEvent}
          />
          <Building listing={selectedListing}/>
        </div>
        <div className="row">
         <ListingForm onSubmit={this.formSubmitEvent} isEditing={ isEditing } editId={ editId } />
        </div>
      </div>
    );
  }
}

export default App;
