import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { CRTWrapper } from '@/components/ui/CRTWrapper';

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <CRTWrapper>
      <Outlet />
    </CRTWrapper>
  ),
});

// Import route components
import HomePage from './routes/index';
import GamePage from './routes/game';
import HighScoresPage from './routes/high-scores';
import SettingsPage from './routes/settings';

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GamePage,
});

const highScoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/high-scores',
  component: HighScoresPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gameRoute,
  highScoresRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree, basepath: '/pacman/' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
