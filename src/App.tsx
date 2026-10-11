/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dashboard from './components/Dashboard';
import { ProfileProvider } from './context/ProfileContext';
import { IncomeProvider } from './context/IncomeContext';
import ProfileModal from './components/ProfileModal';

export default function App() {
  return (
    <ProfileProvider>
      <IncomeProvider>
        <Dashboard />
        <ProfileModal />
      </IncomeProvider>
    </ProfileProvider>
  );
}
