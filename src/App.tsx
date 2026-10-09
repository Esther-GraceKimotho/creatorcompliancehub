/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dashboard from './components/Dashboard';
import { BiometricProvider } from './context/BiometricContext';
import { IncomeProvider } from './context/IncomeContext';
import BiometricModal from './components/BiometricModal';
import BiometricSettingsModal from './components/BiometricSettingsModal';

export default function App() {
  return (
    <BiometricProvider>
      <IncomeProvider>
        <Dashboard />
        <BiometricModal />
        <BiometricSettingsModal />
      </IncomeProvider>
    </BiometricProvider>
  );
}
