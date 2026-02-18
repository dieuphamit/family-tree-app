import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './EdgeStyles.css';
import MemberNode from './MemberNode';
import MemberForm from './MemberForm';
import RelationshipModal from './RelationshipModal';
import { membersAPI, relationshipsAPI } from '../services/api';
import { calculateHierarchicalLayout, getRelationshipLabel, getEdgeStyle } from '../services/treeLayout';
import './FamilyTree.css';
import { useRole } from '../context/RoleContext';
import AdminLogin from './AdminLogin';

// Define nodeTypes outside component to prevent recreation
const nodeTypes = {
    memberNode: MemberNode,
};

function FamilyTree() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [members, setMembers] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showRelationshipModal, setShowRelationshipModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const reactFlowInstance = useReactFlow();
    const [savedViewport, setSavedViewport] = useState(null);
    const [shouldRestoreViewport, setShouldRestoreViewport] = useState(false);

    // Admin state
    const { isAdmin, adminPassword, login, logout } = useRole();
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);

            // Save current viewport (zoom + pan) before fetching
            if (reactFlowInstance) {
                const viewport = reactFlowInstance.getViewport();
                console.log('💾 Saving viewport:', viewport);
                setSavedViewport(viewport);
                setShouldRestoreViewport(true); // Flag to restore after update
            }

            const response = await membersAPI.getAll();

            console.log('🔍 API Response structure:', {
                hasMembersArray: !!response.data.members,
                firstMember: response.data.members?.[0],
                memberCount: response.data.members?.length
            });

            setMembers(response.data.members);
            setRelationships(response.data.relationships);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Restore viewport AFTER ReactFlow is ready
    useEffect(() => {
        if (!reactFlowInstance || nodes.length === 0) return;

        const savedViewportStr = localStorage.getItem('familyTreeViewport');
        if (savedViewportStr) {
            try {
                const viewport = JSON.parse(savedViewportStr);
                console.log('🔄 Restoring viewport:', viewport);
                setTimeout(() => {
                    reactFlowInstance.setViewport(viewport, { duration: 0 });
                    console.log('✅ Viewport restored');
                }, 200);
            } catch (e) {
                console.error('Failed to restore viewport:', e);
            }
        }
    }, [reactFlowInstance, nodes]);

    // Convert members and relationships to React Flow nodes and edges
    useEffect(() => {
        if (members.length === 0) return;

        // Calculate hierarchical layout for positioning
        const autoPositions = calculateHierarchicalLayout(members, relationships);

        // Get current node positions to preserve them
        const currentPositions = {};
        nodes.forEach(node => {
            currentPositions[node.id] = node.position;
        });

        // Create nodes - use existing position if available, otherwise use auto-calculated
        const flowNodes = members.map((member) => {
            // Check if member has DB position (not both 0)
            const hasDbPosition =
                member.positionX !== undefined &&
                member.positionY !== undefined &&
                (member.positionX !== 0 || member.positionY !== 0);

            const dbPosition = hasDbPosition ? { x: member.positionX, y: member.positionY } : null;

            // Priority: current (during drag) > DB saved > auto-calculated
            const position = currentPositions[member._id] || dbPosition || autoPositions[member._id] || { x: 0, y: 0 };

            // Debug: log position source
            console.log(`📍 ${member.name}:`, {
                hasDbPosition,
                dbPosition,
                finalPosition: position,
                source: currentPositions[member._id] ? 'current' : (dbPosition ? 'DB' : 'auto')
            });

            return {
                id: member._id,
                type: 'memberNode',
                position,
                data: {
                    member,
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                },
            };
        });

        // Create edges with enhanced styling
        const flowEdges = [];
        const processedRelationships = new Set();

        // Helper function to find spouse
        const findSpouse = (memberId) => {
            const spouseRel = relationships.find(r =>
                r.relationshipType === 'spouse' &&
                (r.memberId === memberId || r.relatedMemberId === memberId)
            );
            if (!spouseRel) return null;
            return spouseRel.memberId === memberId ? spouseRel.relatedMemberId : spouseRel.memberId;
        };

        // Filter relationships: skip 'child' type since it's just reverse of 'parent'
        const filteredRelationships = relationships.filter(r => r.relationshipType !== 'child');

        filteredRelationships.forEach(rel => {
            if (processedRelationships.has(rel._id)) return;

            const edgeStyle = getEdgeStyle(rel.relationshipType);

            // Handle parent-child relationships
            if (rel.relationshipType === 'parent') {
                const parent = rel.memberId;
                const child = rel.relatedMemberId;
                const childData = members.find(m => m._id === child);
                const childOrder = childData?.childOrder;

                // Find spouse of this parent
                const spouse = findSpouse(parent);

                if (spouse) {
                    // Check if spouse also has parent relationship with this child
                    const spouseParentRel = relationships.find(r =>
                        r.relationshipType === 'parent' &&
                        r.memberId === spouse &&
                        r.relatedMemberId === child
                    );

                    if (spouseParentRel) {
                        // Both parents exist - create edges from both
                        processedRelationships.add(rel._id);
                        processedRelationships.add(spouseParentRel._id);

                        // Edge from parent 1
                        flowEdges.push({
                            id: `${rel._id}-1`,
                            source: parent,
                            target: child,
                            label: childOrder ? `Con ${childOrder}` : '',
                            ...edgeStyle,
                            labelBgPadding: [8, 4],
                            labelBgBorderRadius: 4,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: '#3B82F6',
                            },
                            data: { relationship: rel },
                            className: 'clickable-edge parent-edge',
                        });

                        // Edge from parent 2
                        flowEdges.push({
                            id: `${spouseParentRel._id}-2`,
                            source: spouse,
                            target: child,
                            label: '', // Only show label on one edge to avoid duplication
                            ...edgeStyle,
                            labelBgPadding: [8, 4],
                            labelBgBorderRadius: 4,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: '#3B82F6',
                            },
                            data: { relationship: spouseParentRel },
                            className: 'clickable-edge parent-edge',
                        });
                    } else {
                        // Only one parent has relationship
                        processedRelationships.add(rel._id);
                        flowEdges.push({
                            id: rel._id,
                            source: parent,
                            target: child,
                            label: getRelationshipLabel(rel.relationshipType, childOrder),
                            ...edgeStyle,
                            labelBgPadding: [8, 4],
                            labelBgBorderRadius: 4,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: '#3B82F6',
                            },
                            data: { relationship: rel },
                            className: 'clickable-edge',
                        });
                    }
                } else {
                    // Single parent
                    processedRelationships.add(rel._id);
                    flowEdges.push({
                        id: rel._id,
                        source: parent,
                        target: child,
                        label: getRelationshipLabel(rel.relationshipType, childOrder),
                        ...edgeStyle,
                        labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: '#3B82F6',
                        },
                        data: { relationship: rel },
                        className: 'clickable-edge',
                    });
                }
            } else {
                // Non-parent relationships (spouse, sibling, etc.)
                processedRelationships.add(rel._id);
                flowEdges.push({
                    id: rel._id,
                    source: rel.memberId,
                    target: rel.relatedMemberId,
                    label: getRelationshipLabel(rel.relationshipType),
                    ...edgeStyle,
                    labelBgPadding: [8, 4],
                    labelBgBorderRadius: 4,
                    data: { relationship: rel },
                    className: 'clickable-edge',
                });
            }
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [members, relationships]);

    // Restore viewport after nodes/edges update (only after data fetch, not during drag)
    useEffect(() => {
        if (shouldRestoreViewport && savedViewport && reactFlowInstance && nodes.length > 0) {
            console.log('🔄 Restoring viewport:', savedViewport);
            // Use setTimeout to ensure nodes are rendered first
            setTimeout(() => {
                reactFlowInstance.setViewport(savedViewport, { duration: 0 });
                console.log('✅ Viewport restored');
                setShouldRestoreViewport(false); // Reset flag
            }, 100); // Increased timeout for proper rendering
        }
    }, [nodes, shouldRestoreViewport]);

    // Save node positions to localStorage when they change
    useEffect(() => {
        if (nodes.length > 0) {
            const positions = {};
            nodes.forEach(node => {
                positions[node.id] = node.position;
            });
            localStorage.setItem('familyTreeNodePositions', JSON.stringify(positions));
        }
    }, [nodes]);

    const handleEdit = useCallback((member) => {
        console.log('handleEdit called with:', member);
        setEditingMember(member);
        setShowForm(true);
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (!confirm('Bạn có chắc muốn xóa thành viên này? Tất cả các mối quan hệ cũng sẽ bị xóa.')) {
            return;
        }

        try {
            await membersAPI.delete(id);
            await fetchData();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Không thể xóa thành viên.');
        }
    }, []);

    const handleSubmit = async (formData) => {
        try {
            if (editingMember) {
                await membersAPI.update(editingMember._id, formData);
            } else {
                await membersAPI.create(formData);
            }

            await fetchData();
            setShowForm(false);
            setEditingMember(null);
        } catch (error) {
            console.error('Error saving member:', error);
            throw error;
        }
    };

    const handleAddMember = () => {
        setEditingMember(null);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingMember(null);
    };

    const handleAddRelationship = () => {
        setShowRelationshipModal(true);
    };

    const handleRelationshipSuccess = async () => {
        await fetchData();
    };

    // Save layout to database (admin only)
    const handleSaveLayout = async () => {
        if (!isAdmin) {
            alert('Chỉ admin mới có thể lưu bố cục!');
            return;
        }

        try {
            const positions = {};
            nodes.forEach(node => {
                positions[node.id] = { x: node.position.x, y: node.position.y };
            });

            console.log('💾 Saving positions:', positions);

            // Save current viewport to localStorage
            if (reactFlowInstance) {
                const viewport = reactFlowInstance.getViewport();
                localStorage.setItem('familyTreeViewport', JSON.stringify(viewport));
                console.log('💾 Saving viewport:', viewport);
            }

            const saveLayoutUrl = import.meta.env.PROD ? '/api/members/save-layout' : 'http://localhost:3001/api/members/save-layout';
            const response = await fetch(saveLayoutUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': adminPassword
                },
                body: JSON.stringify({ positions })
            });

            const data = await response.json();

            if (response.ok) {
                setSaveMessage('✅ Đã lưu bố cục!');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                alert('Lỗi: ' + data.error);
            }
        } catch (error) {
            console.error('Save layout error:', error);
            alert('Không thể lưu bố cục');
        }
    };

    const handleAdminLogin = (password) => {
        login(password);
    };

    const handleAdminLogout = () => {
        if (confirm('Thoát chế độ admin?')) {
            logout();
        }
    };

    const handleEdgeClick = (event, edge) => {
        // Get relationship from edge data
        const relationship = edge.data?.relationship;

        if (!relationship) {
            console.error('No relationship data found in edge');
            return;
        }

        const memberFrom = members.find(m => m._id === relationship.memberId);
        const memberTo = members.find(m => m._id === relationship.relatedMemberId);

        const message = `Xóa mối quan hệ "${relationship.relationshipType}" giữa ${memberFrom?.name} và ${memberTo?.name}?`;

        if (window.confirm(message)) {
            handleDeleteRelationship(relationship._id);
        }
    };

    const handleDeleteRelationship = async (id) => {
        try {
            await relationshipsAPI.delete(id);
            await fetchData();
        } catch (error) {
            console.error('Error deleting relationship:', error);
            alert('Không thể xóa mối quan hệ.');
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Đang tải cây gia phả...</p>
            </div>
        );
    }

    return (
        <div className="family-tree-container">
            <header className="app-header glass">
                <div className="header-left">
                    <h1>🌳 Cây Gia Phả</h1>
                    {isAdmin && <span className="admin-badge">👤 Admin</span>}
                </div>
                <div className="header-actions">
                    {isAdmin ? (
                        <>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                ➕ Thêm thành viên
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowRelationshipModal(true)}>
                                🔗 Tạo mối quan hệ
                            </button>
                            <button className="btn save-layout-btn" onClick={handleSaveLayout}>
                                💾 Lưu bố cục
                            </button>
                            <button className="btn logout-btn" onClick={handleAdminLogout}>
                                🚪 Thoát Admin
                            </button>
                        </>
                    ) : (
                        <button className="btn admin-btn" onClick={() => setShowAdminLogin(true)}>
                            🔓 Admin
                        </button>
                    )}
                </div>
            </header>

            {saveMessage && <div className="save-toast">{saveMessage}</div>}

            <AdminLogin
                isOpen={showAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                onSuccess={handleAdminLogin}
            />

            <div className="tree-viewport">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={isAdmin ? onNodesChange : undefined}
                    onEdgesChange={onEdgesChange}
                    onEdgeClick={isAdmin ? handleEdgeClick : undefined}
                    nodeTypes={nodeTypes}
                    nodesDraggable={isAdmin}
                    nodesConnectable={false}
                    elementsSelectable={isAdmin}
                    attributionPosition="bottom-left"
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            const member = node.data.member;
                            return member.gender === 'male' ? '#2563EB' :
                                member.gender === 'female' ? '#EC4899' : '#8B5CF6';
                        }}
                        maskColor="rgba(0, 0, 0, 0.1)"
                    />
                </ReactFlow>
            </div>

            {showForm && (
                <MemberForm
                    member={editingMember}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            {showRelationshipModal && (
                <RelationshipModal
                    onClose={() => setShowRelationshipModal(false)}
                    onSuccess={handleRelationshipSuccess}
                />
            )}
        </div>
    );
}

export default FamilyTree;
