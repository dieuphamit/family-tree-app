/**
 * Calculate hierarchical layout for family tree
 * Automatically positions nodes based on generations
 */

export function calculateHierarchicalLayout(members, relationships) {
    if (!members || members.length === 0) return {};

    // 1. Find root members (those without parents)
    const memberIds = new Set(members.map(m => m._id));
    const childrenIds = new Set(
        relationships
            .filter(r => r.relationshipType === 'child')
            .map(r => r.memberId)
    );

    const rootMembers = members.filter(m => !childrenIds.has(m._id));

    // 2. Calculate generation for each member using BFS
    const generations = calculateGenerations(members, relationships, rootMembers);

    // 3. Group members by generation
    const byGeneration = {};
    members.forEach(member => {
        const gen = generations[member._id] || 0;
        if (!byGeneration[gen]) byGeneration[gen] = [];
        byGeneration[gen].push(member);
    });

    // 4. Sort within each generation
    Object.keys(byGeneration).forEach(gen => {
        byGeneration[gen].sort((a, b) => {
            // Sort by childOrder if available
            if (a.childOrder && b.childOrder) {
                return a.childOrder - b.childOrder;
            }
            // Then by name
            return a.name.localeCompare(b.name);
        });
    });

    // 5. Calculate positions
    const positions = {};
    const generationKeys = Object.keys(byGeneration).sort((a, b) => a - b);

    generationKeys.forEach((gen, genIndex) => {
        const membersInGen = byGeneration[gen];
        const totalWidth = membersInGen.length * 300;
        const startX = -totalWidth / 2;

        membersInGen.forEach((member, memberIndex) => {
            positions[member._id] = {
                x: startX + memberIndex * 300,
                y: genIndex * 280
            };
        });
    });

    return positions;
}

function calculateGenerations(members, relationships, rootMembers) {
    const generations = {};
    const queue = rootMembers.map(m => ({ id: m._id, gen: 0 }));
    const visited = new Set();

    // BFS to calculate generations
    while (queue.length > 0) {
        const { id, gen } = queue.shift();

        if (visited.has(id)) continue;
        visited.add(id);

        generations[id] = gen;

        // Find children
        const children = relationships
            .filter(r => r.relationshipType === 'parent' && r.memberId === id)
            .map(r => r.relatedMemberId);

        children.forEach(childId => {
            if (!visited.has(childId)) {
                queue.push({ id: childId, gen: gen + 1 });
            }
        });
    }

    // Handle unconnected members
    members.forEach(m => {
        if (generations[m._id] === undefined) {
            generations[m._id] = m.generation || 0;
        }
    });

    return generations;
}

/**
 * Get relationship label based on type
 */
export function getRelationshipLabel(relationshipType, childOrder = null) {
    switch (relationshipType) {
        case 'parent':
            return childOrder ? `Con ${childOrder}` : 'Con cái';
        case 'child':
            return 'Cha/Mẹ';
        case 'spouse':
            return '💑 Vợ chồng';
        case 'sibling':
            return 'Anh chị em';
        default:
            return '';
    }
}

/**
 * Get edge style based on relationship type - IMPROVED VISIBILITY
 */
export function getEdgeStyle(relationshipType) {
    switch (relationshipType) {
        case 'parent':
            return {
                type: 'straight',  // Changed from smoothstep to straight for clarity
                style: {
                    stroke: '#3B82F6',  // Brighter blue
                    strokeWidth: 3,     // Thicker for visibility
                },
                labelStyle: {
                    fill: '#1E40AF',    // Darker blue for contrast
                    fontWeight: 700,
                    fontSize: 13,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                },
                labelBgStyle: {
                    fill: 'rgba(255, 255, 255, 0.95)',
                    fillOpacity: 0.9,
                },
                animated: false
            };
        case 'spouse':
            return {
                type: 'straight',
                style: {
                    stroke: '#EC4899',  // Pink
                    strokeWidth: 4,     // Thickest for emphasis
                },
                labelStyle: {
                    fill: '#BE185D',    // Darker pink
                    fontWeight: 700,
                    fontSize: 14,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                },
                labelBgStyle: {
                    fill: 'rgba(255, 255, 255, 0.95)',
                    fillOpacity: 0.9,
                },
                animated: true
            };
        case 'sibling':
            return {
                type: 'straight',
                style: {
                    stroke: '#A855F7',  // Purple
                    strokeWidth: 2.5,
                    strokeDasharray: '8,4',  // Longer dashes
                },
                labelStyle: {
                    fill: '#7C3AED',
                    fontWeight: 600,
                    fontSize: 12,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                },
                labelBgStyle: {
                    fill: 'rgba(255, 255, 255, 0.95)',
                    fillOpacity: 0.9,
                },
                animated: false
            };
        default:
            return {
                type: 'straight',
                style: {
                    stroke: '#64748B',
                    strokeWidth: 2
                },
                labelStyle: {
                    fill: '#475569',
                    fontWeight: 500
                },
                animated: false
            };
    }
}
