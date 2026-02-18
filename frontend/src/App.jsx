import { ReactFlowProvider } from 'reactflow';
import { RoleProvider } from './context/RoleContext';
import FamilyTree from './components/FamilyTree';
import './index.css';

function App() {
  return (
    <RoleProvider>
      <ReactFlowProvider>
        <FamilyTree />
      </ReactFlowProvider>
    </RoleProvider>
  );
}

export default App;
