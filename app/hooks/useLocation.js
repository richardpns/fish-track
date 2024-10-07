// hooks/useLocation.js
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão para acessar localização foi negada.');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (err) {
        setError('Erro ao obter a localização. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, loading, error };
};

export default useLocation;
