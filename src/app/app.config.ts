import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideLucideIcons,
  LucideArrowRight,
  LucideArrowUpRight,
  LucideCalendar,
  LucideCheck,
  LucideCheckCircle2,
  LucideChevronRight,
  LucideClock,
  LucideExternalLink,
  LucideFileText,
  LucideHandCoins,
  LucideImage,
  LucideInbox,
  LucideLayoutDashboard,
  LucideList,
  LucideLoaderCircle,
  LucideLogOut,
  LucideMail,
  LucideMapPin,
  LucideMenu,
  LucideMessageCircle,
  LucideMessageSquare,
  LucidePencil,
  LucidePlus,
  LucideSave,
  LucideSettings,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from '@lucide/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideLucideIcons(
      // public site
      LucideArrowRight, LucideArrowUpRight, LucideCheckCircle2, LucideClock,
      LucideExternalLink, LucideMail, LucideMapPin, LucideMenu,
      LucideMessageCircle, LucideX,
      // admin
      LucideCalendar, LucideCheck, LucideChevronRight, LucideFileText,
      LucideHandCoins, LucideImage, LucideInbox, LucideLayoutDashboard,
      LucideList, LucideLoaderCircle, LucideLogOut, LucideMessageSquare,
      LucidePencil, LucidePlus, LucideSave, LucideSettings, LucideTrash2,
      LucideUsers,
    ),
  ],
};
