import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './MemberNode.css';
import { useRole } from '../context/RoleContext';

function MemberNode({ data }) {
    const { member, onEdit, onDelete } = data;
    const { isAdmin } = useRole();

    const genderColor = {
        male: '#2563EB',
        female: '#EC4899',
        other: '#8B5CF6'
    }[member.gender] || '#64748B';

    const getAge = () => {
        if (!member.dateOfBirth) return '';
        const birth = new Date(member.dateOfBirth);
        const end = member.dateOfDeath ? new Date(member.dateOfDeath) : new Date();
        const age = end.getFullYear() - birth.getFullYear();
        return member.dateOfDeath ? `(${age} tuổi)` : `${age} tuổi`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).getFullYear();
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="member-node" style={{ borderLeftColor: genderColor }}>
            <Handle type="target" position={Position.Top} className="node-handle" />

            <div className="node-content">
                <div className="node-header">
                    {member.photoUrl && member.photoUrl !== '/uploads/default-avatar.png' ? (
                        <img
                            src={import.meta.env.PROD ? member.photoUrl : `http://localhost:3001${member.photoUrl}`}
                            alt={member.name}
                            className="node-avatar"
                        />
                    ) : (
                        <div className="node-avatar-placeholder" style={{ background: genderColor }}>
                            {getInitials(member.name)}
                        </div>
                    )}

                    <div className="node-actions">
                        <button className="node-btn" onClick={() => onEdit(member)} title="Sửa">
                            ✏️
                        </button>
                        <button className="node-btn" onClick={() => onDelete(member._id)} title="Xóa">
                            🗑️
                        </button>
                    </div>
                </div>

                <h3 className="node-name">{member.name}</h3>

                <div className="node-info">
                    {member.dateOfBirth && (
                        <div className="info-row">
                            📅 {formatDate(member.dateOfBirth)}
                            {member.dateOfDeath && ` - ${formatDate(member.dateOfDeath)}`}
                            {' '}{getAge()}
                        </div>
                    )}

                    {member.placeOfResidence && (
                        <div className="info-row">
                            📍 {member.placeOfResidence}
                        </div>
                    )}

                    {member.maritalStatus && (
                        <div className="info-row">
                            💍 {member.maritalStatus === 'married' ? 'Đã kết hôn' :
                                member.maritalStatus === 'single' ? 'Độc thân' :
                                    member.maritalStatus === 'divorced' ? 'Ly hôn' : 'Góa'}
                        </div>
                    )}

                    {member.occupation && (
                        <div className="info-row">
                            💼 {member.occupation}
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="node-handle" />
        </div>
    );
}

export default memo(MemberNode);
