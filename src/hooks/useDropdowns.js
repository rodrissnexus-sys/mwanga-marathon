import { useState, useEffect } from 'react';
import { 
    fetchEvents, 
    fetchShirtSizes, 
    fetchCollectionVenues, 
    fetchCountries, 
    fetchGenders 
} from '../api/dropdowns';

export const useDropdowns = () => {
    const [events, setEvents] = useState([]);
    const [shirtSizes, setShirtSizes] = useState([]);
    const [kidsShirtSizes, setKidsShirtSizes] = useState([]);
    const [collectionVenues, setCollectionVenues] = useState([]);
    const [countries, setCountries] = useState([]);
    const [genders, setGenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setLoading(true);
                const [
                    eventsResponse,
                    venuesResponse,
                    adultSizesResponse,
                    kidsSizesResponse,
                    countriesResponse,
                    gendersResponse
                ] = await Promise.all([
                    fetchEvents(),
                    fetchCollectionVenues(),
                    fetchShirtSizes(false),
                    fetchShirtSizes(true),
                    fetchCountries(),
                    fetchGenders()
                ]);

                if (eventsResponse.success) {
                    const transformedEvents = eventsResponse.data.map(event => {
                        // Ensure price values are numbers
                        const localPrice = parseFloat(event.local_price) || 0;
                        const foreignPrice = parseFloat(event.foreign_price) || 0;
                        const localKidsPrice = parseFloat(event.local_kids_price) || 0;

                        return {
                            id: event.id,
                            name: event.name,
                            description: event.description,
                            localPrice,
                            foreignPrice,
                            localKidsPrice,
                            isKidsEvent: Boolean(event.is_kids_event),
                            distanceKm: event.distance_km
                        };
                    });
                    setEvents(transformedEvents);
                }

                if (venuesResponse.success) {
                    const transformedVenues = venuesResponse.data.map(venue => ({
                        id: venue.id,
                        name: venue.name,
                        description: venue.description,
                        address: venue.address
                    }));
                    setCollectionVenues(transformedVenues);
                }

                if (adultSizesResponse.success) {
                    setShirtSizes(adultSizesResponse.data.map(size => ({
                        id: size.id,
                        code: size.code,
                        name: size.name
                    })));
                }
                if (kidsSizesResponse.success) {
                    setKidsShirtSizes(kidsSizesResponse.data.map(size => ({
                        id: size.id,
                        code: size.code,
                        name: size.name
                    })));
                }
                if (countriesResponse.success) {
                    setCountries(countriesResponse.data.map(country => ({
                        id: country.id,
                        code: country.code,
                        name: country.name
                    })));
                }
                if (gendersResponse.success) {
                    setGenders(gendersResponse.data.map(gender => ({
                        id: gender.id,
                        code: gender.code,
                        name: gender.name
                    })));
                }

            } catch (err) {
                console.error('Error loading dropdowns:', err);
                setError('Failed to load dropdown options');
            } finally {
                setLoading(false);
            }
        };

        loadDropdowns();
    }, []);

    // Helper functions
    const getEventByName = (eventName) => {
        const event = events.find(event => event.name === eventName);
        return event;
    };

    const getVenueByName = (venueName) => {
        const venue = collectionVenues.find(venue => venue.name === venueName);
        return venue;
    };

    // Transform data to match the existing frontend format
    const transformedData = {
        events, // Pass the full transformed events directly
        sizes: shirtSizes.map(size => size.code), // Keep display as codes
        kidsSizes: kidsShirtSizes.map(size => size.code), // Keep display as codes
        collectionVenues, // Pass the full transformed venues directly
        countries, // Pass the full country objects
        genders, // Pass the full gender objects
        // Keep the raw data for form submission
        rawData: {
            events: events.map(event => ({
                id: event.id,
                name: event.name,
                description: event.description,
                local_price: event.localPrice,
                foreign_price: event.foreignPrice,
                local_kids_price: event.localKidsPrice
            })),
            shirtSizes, // Store full objects for ID lookup
            kidsShirtSizes, // Store full objects for ID lookup
            collectionVenues: collectionVenues.map(venue => ({
                id: venue.id,
                name: venue.name,
                address: venue.address,
                description: venue.description
            })),
            countries,
            genders
        },
        // Add helper functions
        getEventByName,
        getVenueByName
    };

    return {
        ...transformedData,
        loading,
        error
    };
};
