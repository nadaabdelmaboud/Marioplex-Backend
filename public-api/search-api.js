const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
const artistApi = require('./artist-api');
const user_api = require('./user-api');
const track = require('./track-api');
const artist_api = require('./artist-api');
const album_api = require('./album-api');

const Search = {

    //get all users
    getUsers: async function() {

        let user = await userDocument.find({}, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        return user;

    },
    getArtists: async function() {

        let artist = await artistDocument.find({}, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;

    },

    //get all albums
    getAlbums: async function() {
        let album = await albumDocument.find({}, (err, album) => {
            if (err) return 0;
            return album;
        }).catch((err) => 0);
        return album;

    },

    //get user by name
    //params: name
    getUserByname: async function(name) {

        const user = await this.getUsers();
        if (user.length == 0) return 0;
        return Fuzzysearch(name, 'displayName', user);

    },
    getArtistByname: async function(name) {

        const artist = await this.getArtists();
        if (artist.length == 0) return 0;
        return Fuzzysearch(name, 'Name', artist);

    },
    

    //get top result by search name
    //params: Name
    getTop: async function(Name) {

        const artist = await this.getArtistProfile(Name);
        //console.log(artist)
        if (artist) {
            return artist[0]._id
        }
        return 0;

    },

    //get all playlists
    getPlaylists: async function() {
        let playlist = await playlistDocument.find({ isPublic: true }, (err, playlist) => {
            if (err) return 0;
            return playlist;
        }).catch((err) => 0);
        return playlist;
    },

    //get all tracks
    getTracks: async function() {
        let track = await trackDocument.find({}, (err, track) => {
            if (err) return 0;
            return track;
        }).catch((err) => 0);
        return track;
    },

    //search for an exact match of the name sent
    //params: array, name
    exactmatch: async function(array, name) {

        let firstname;
        if(!array) array = [];
        for (let i = 0; i < array.length; i++) {
            subname = array[i].Name.split(' ');
            firstname = subname[0];
            if (firstname == name) {
                return array[i]._id;
            }
        }
        return 0;

    },

    //get all albums with the name albumName
    //params: albumName, groups, country, limit, offset
    getAlbum: async function(albumName, groups, country, limit, offset) {

        var allalbum;
        let allartists = await artistDocument.find({});
        let artist = await this.exactmatch(allartists, albumName);
        if (artist) {

            allalbum = await artistApi.getAlbums(artist, groups, country, limit, offset);

        } 
        else {
            allalbum = await this.getAlbums();
            if (allalbum.length == 0) return allalbum;
            allalbum = Fuzzysearch(albumName, 'name', allalbum);

        }
        if(!allalbum) allalbum = [];
        Album = []
        for (let i = 0; i < allalbum.length; i++) {
            let albums = await album_api.getAlbumArtist(allalbum[i]._id);
            if (albums) {
                album = {}
                album["_id"] = albums._id
                album["name"] = albums.name
                album["images"] = albums.images
                album["type"] = "Album";
                if (albums) {
                    album["artistId"] = albums.artistId;
                    album["artistName"] = albums.artistName;
                    album["artistType"] = "Artist";

                }
                Album.push(album);
            }
        }
        return Album;
        
    },

    //get all tracks with Name
    //params: Name
    getTrack: async function(Name, limit, offset) {

        var Track;
        let allartists = await artistDocument.find({});
        let artist = await this.exactmatch(allartists, Name);
        if (artist) {

            Track = await artistApi.getTracks(artist);

        } 
        else {
            const track = await this.getTracks();
            if (track == 0) return track;
            Track = Fuzzysearch(Name, 'name', track);
        }

        trackInfo = []
        if(!Track) Track = [];
        for (let i = 0; i < Track.length; i++) {
            let artist = await artist_api.getArtist(Track[i].artistId)
            tracks = {}
            if (artist) {
                tracks["artistId"] = artist._id
                tracks["artistName"] = artist.Name
                tracks["artistimages"] = artist.images
                tracks["artistType"] = artist.type
            }
            let album = await album_api.getAlbumById(Track[i].albumId)
            if (album) {
                tracks["albumId"] = album._id
                tracks["albumName"] = album.name
                tracks["albumImages"] = album.images
                tracks["albumType"] = album.type
            }
            tracks["_id"] = Track[i]._id
            tracks["name"] = Track[i].name
            tracks["type"] = Track[i].type
            tracks["images"] = Track[i].images
            trackInfo.push(tracks);

        }
        return limitOffset(limit, offset, trackInfo);
     

    },

    //get top results with Name
    //params: Name
    getTopResults: async function(Name) {
        const artist = await this.getTop(Name);
        if (artist) {
            let artist = await this.getArtistProfile(Name)
            return artist[0]
        }
        let track = await this.getTrack(Name);
        if (track && track.length != 0) {
            return track[0];
        }
        let album = await this.getAlbum(Name);
        if (album && album.length != 0) {
            return album[0];
        }
        let playlist = await this.getPlaylist(Name);
        if (playlist && playlist.length != 0) {
            return playlist[0];
        }
        let profile = await this.getUserProfile(Name);
        if (profile && profile.length != 0) {
            return profile[0];
        }

    },

    //get all artist profile with name
    //params: name
    getArtistProfile: async function(name, limit, offset) {

        let artistsInfo = [];
        let artist = await this.getArtistByname(name);
        if(!artist) artist = [];
        if (artist.length == 0) return 0;
        else{
            for(let i = 0; i < artist.length; i++) {
                artistInfo = {}
                artistInfo["_id"] = artist[i]._id
                artistInfo["name"] = artist[i].Name
                artistInfo["images"] = artist[i].images
                artistInfo["info"] = artist[i].info
                artistInfo["type"] = artist[i].type
                artistInfo["genre"] = artist[i].genre
                artistsInfo.push(artistInfo);

            }
        }
        if (artistsInfo.length == 0) return 0;
        return limitOffset(limit, offset, artistsInfo);

    },
    

    //get all user profiles with name
    //params: name
    getUserProfile: async function(name, limit, offset) {

        UserInfo = []
        let User = await this.getUserByname(name);
        if(!User) User=[];
        if (User.length == 0) return User;
        else {
            for (let i = 0; i < User.length; i++) {
                if (User[i].userType == "Artist") {
                    continue;
                } 
                else {

                    user = {}
                    user["_id"] = User[i]._id
                    user["displayName"] = User[i].displayName
                    user["images"] = User[i].images
                    user["type"] = User[i].type
                    UserInfo.push(user)
                }
            }

            return limitOffset(limit, offset, UserInfo);
        }

    },

    //get all playlists with Name
    //params Name
    getPlaylist: async function(Name, limit, offset) {

        let playlist = await this.getPlaylists();
        if (playlist && playlist.length == 0) return playlist;
        playlist = Fuzzysearch(Name, 'name', playlist);
        playlistInfo = []
        for (let i = 0; i < playlist.length; i++) {
            let User = await user_api.getUserById(playlist[i].ownerId)
            Playlist = {}
            if (User) {
                Playlist["ownerId"] = User._id
                Playlist["ownerName"] = User.displayName
                Playlist["ownerImages"] = User.images
                Playlist["ownerType"] = User.type
            }

            Playlist["_id"] = playlist[i]._id
            Playlist["name"] = playlist[i].name
            Playlist["type"] = playlist[i].type
            Playlist["images"] = playlist[i].images
            playlistInfo.push(Playlist)

        }
        return limitOffset(limit, offset, playlistInfo);
    }

}
module.exports = Search;

//search for name in schema
//params: field, name, schema  
function search(name, field, schema) {

    const searcher = new FuzzySearch(schema, [field], {
        caseSensitive: false,
        sort: true
    });
    const users = searcher.search(name);
    return users;

}

//use fuzzy search to search for field in schema with name
//params: name, field, schema
function Fuzzysearch(name, field, schema) {

    Results = []
    if(!name)name='';
    subName = name.split(' ');
    let results = search(name, field, schema);
    Results = Results.concat(results);
    for (let i = 0; i < subName.length; i++) {
        results = search(subName[i], field, schema);
        Results = Results.concat(results);
    }
    return removeDupliactes(Results);

}

//remove duplicates from array
//params: values
const removeDupliactes = (values) => {

    let newArray = [];
    let uniqueObject = {};
    if(!values) values=[];
    for (let i in values) {
        objTitle = values[i]['_id'];
        uniqueObject[objTitle] = values[i];
    }

    for (i in uniqueObject) {
        newArray.push(uniqueObject[i]);
    }
    return newArray;
}
function limitOffset(limit,offset,search){

    let start = 0;
    let end = search.length;
    if (offset != undefined) {
        if (offset >= 0 && offset <= search.length) {
            start = offset;
        }
    }
    if (limit != undefined) {
        if ((start + limit) > 0 && (start + limit) <= search.length) {
            end = start + limit;
        }
    } 
    else {
        limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
        if ((start + limit) > 0 && (start + limit) <= search.length) {
            end = start + limit;
        }
    }
    search.slice(start, end);
    return search;
}