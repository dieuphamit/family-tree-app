import { useState, useEffect } from 'react';
import { uploadAPI } from '../services/api';
import './MemberForm.css';

function MemberForm({ member, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        dateOfBirth: '',
        dateOfDeath: '',
        placeOfResidence: '',
        maritalStatus: 'single',
        occupation: '',
        notes: '',
        photoUrl: '/uploads/default-avatar.png'
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (member) {
            setFormData({
                ...member,
                dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
                dateOfDeath: member.dateOfDeath ? new Date(member.dateOfDeath).toISOString().split('T')[0] : ''
            });
            if (member.photoUrl && member.photoUrl !== '/uploads/default-avatar.png') {
                setPhotoPreview(`http://localhost:5000${member.photoUrl}`);
            }
        }
    }, [member]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let photoUrl = formData.photoUrl;

            // Upload photo if new file selected
            if (photoFile) {
                const uploadResponse = await uploadAPI.uploadPhoto(photoFile);
                photoUrl = uploadResponse.data.photoUrl;
            }

            const submitData = {
                ...formData,
                photoUrl,
                dateOfBirth: formData.dateOfBirth || null,
                dateOfDeath: formData.dateOfDeath || null
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <h2>{member ? 'Sửa thông tin thành viên' : 'Thêm thành viên mới'}</h2>

                <form onSubmit={handleSubmit} className="member-form">
                    <div className="form-photo-section">
                        <div className="photo-preview">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" />
                            ) : (
                                <div className="photo-placeholder">📷</div>
                            )}
                        </div>
                        <label className="photo-upload-btn btn-secondary">
                            Chọn ảnh
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handlePhotoChange}
                                hidden
                            />
                        </label>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tên đầy đủ *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giới tính *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Ngày sinh *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày mất</label>
                            <input
                                type="date"
                                name="dateOfDeath"
                                value={formData.dateOfDeath}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nơi cư trú</label>
                            <input
                                type="text"
                                name="placeOfResidence"
                                value={formData.placeOfResidence}
                                onChange={handleChange}
                                placeholder="Hà Nội"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tình trạng hôn nhân</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                <option value="single">Độc thân</option>
                                <option value="married">Đã kết hôn</option>
                                <option value="divorced">Ly hôn</option>
                                <option value="widowed">Góa</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Nghề nghiệp</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                placeholder="Kỹ sư"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Ghi chú</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Thông tin bổ sung..."
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : (member ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MemberForm;
