import { Navigate, useLocation } from 'react-router-dom';

const Home = () => {
    const location = useLocation();

    return <Navigate to={`/overview${location.search}`} replace />;
};

export default Home;
