import { useState, useEffect } from 'react';
import { relationshipsAPI, membersAPI } from '../services/api';
import './RelationshipModal.css';

function RelationshipModal({ onClose, onSuccess }) {
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        member1Id: '',
        member2Id: '',
        relationshipType: 'spouse',
        childOrder: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await membersAPI.getAll();
            setMembers(response.data.members);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'childOrder' ? (value ? parseInt(value) : null) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.member1Id || !formData.member2Id) {
            alert('Vui lòng chọn cả 2 thành viên');
            return;
        }

        if (formData.member1Id === formData.member2Id) {
            alert('Không thể tạo mối quan hệ với chính mình');
            return;
        }

        setLoading(true);

        try {
            // Determine relationship direction based on type
            let relationshipData;

            if (formData.relationshipType === 'parent-child') {
                // member1 is parent, member2 is child
                relationshipData = {
                    memberId: formData.member1Id,  // parent
                    relatedMemberId: formData.member2Id,  // child
                    relationshipType: 'parent'
                };

                // Update child order for member2
                if (formData.childOrder) {
                    await membersAPI.update(formData.member2Id, { childOrder: formData.childOrder });
                }
            } else if (formData.relationshipType === 'spouse') {
                relationshipData = {
                    memberId: formData.member1Id,
                    relatedMemberId: formData.member2Id,
                    relationshipType: 'spouse'
                };
            } else if (formData.relationshipType === 'sibling') {
                relationshipData = {
                    memberId: formData.member1Id,
                    relatedMemberId: formData.member2Id,
                    relationshipType: 'sibling'
                };
            }

            await relationshipsAPI.create(relationshipData);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating relationship:', error);
            alert(error.response?.data?.error || 'Không thể tạo mối quan hệ');
        } finally {
            setLoading(false);
        }
    };

    const showChildOrder = formData.relationshipType === 'parent-child';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <h2>🔗 Tạo mối quan hệ</h2>

                <form onSubmit={handleSubmit} className="relationship-form">
                    <div className="form-group">
                        <label>Thành viên 1 *</label>
                        <select
                            name="member1Id"
                            value={formData.member1Id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn thành viên --</option>
                            {members.map(member => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Loại quan hệ *</label>
                        <select
                            name="relationshipType"
                            value={formData.relationshipType}
                            onChange={handleChange}
                            required
                        >
                            <option value="spouse">💑 Vợ chồng</option>
                            <option value="parent-child">👨‍👩‍👧 Cha/Mẹ → Con</option>
                            <option value="sibling">👫 Anh chị em</option>
                        </select>
                        <small className="hint">
                            {formData.relationshipType === 'parent-child' &&
                                'Thành viên 1 là cha/mẹ, Thành viên 2 là con'}
                            {formData.relationshipType === 'spouse' &&
                                'Tạo quan hệ vợ chồng giữa 2 người'}
                            {formData.relationshipType === 'sibling' &&
                                'Tạo quan hệ anh chị em'}
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Thành viên 2 *</label>
                        <select
                            name="member2Id"
                            value={formData.member2Id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn thành viên --</option>
                            {members
                                .filter(m => m._id !== formData.member1Id)
                                .map(member => (
                                    <option key={member._id} value={member._id}>
                                        {member.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {showChildOrder && (
                        <div className="form-group">
                            <label>Thứ tự con (tùy chọn)</label>
                            <input
                                type="number"
                                name="childOrder"
                                value={formData.childOrder || ''}
                                onChange={handleChange}
                                min="1"
                                placeholder="1, 2, 3..."
                            />
                            <small className="hint">Con thứ mấy trong gia đình (1 = con cả)</small>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo mối quan hệ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RelationshipModal;
