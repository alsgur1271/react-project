import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    fetch(`/api/teacher/${teacherId}`)
      .then(res => res.json())
      .then(data => setTeacherData(data));
  }, [teacherId]);

  if (!teacherData) return <div>Loading...</div>;

  return (
    <div>
      <h2>{teacherData.name} 선생님의 프로필</h2>
      <p>{teacherData.intro}</p>

      {/* 🔽 자료 업로드 버튼 추가 */}
      <Link to="/upload">
        <button>자료 업로드</button>
      </Link>

      <h3>업로드한 자료</h3>
      <ul>
        {teacherData.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherProfile;
