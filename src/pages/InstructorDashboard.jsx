import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function InstructorDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", instructor: "" });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [studentsByCourse, setStudentsByCourse] = useState({});

  // Video modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "link"
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");

  const scrollRef = useRef(null); // Horizontal scroll ref

  useEffect(() => {
    if (user) setForm(prev => ({ ...prev, instructor: user.name }));
  }, [user]);

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };

  const fetchStudentsForCourse = async (courseId) => {
    try {
      const res = await axios.get(
        `https://flexopted-backend.onrender.com/api/courses/${courseId}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentsByCourse(prev => ({ ...prev, [courseId]: res.data }));
    } catch (err) {
      console.error(`Error fetching students for course ${courseId}:`, err);
    }
  };

  const fetchCourses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("https://flexopted-backend.onrender.com/api/courses", config);
      setCourses(res.data);
      res.data.forEach(course => fetchStudentsForCourse(course.id));
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token) return alert("You are not logged in");

    try {
      if (editingCourseId) {
        await axios.put(`https://flexopted-backend.onrender.com/api/courses/${editingCourseId}`, form, config);
      } else {
        await axios.post("https://flexopted-backend.onrender.com/api/courses", form, config);
      }
      setForm({ title: "", description: "", instructor: user.name });
      setEditingCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
    }
  };

  const handleEdit = course => {
    setEditingCourseId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
    });
  };

  const handleDelete = async id => {
    if (!token) return alert("You are not logged in");
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`https://flexopted-backend.onrender.com/api/courses/${id}`, config);
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  const handleVideoUpload = async () => {
    console.log("handleVideoUpload called");
    console.log("Selected file:", videoFile);
    console.log("Editing course ID:", editingCourseId);
    
    if (!videoFile) return alert("Please select a video file");
    if (!editingCourseId) return alert("No course selected for video upload");

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      await axios.post(
        `https://flexopted-backend.onrender.com/api/courses/${editingCourseId}/upload-video`,
        formData,
        { headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
        }
        }
      );
      setShowVideoModal(false);
      setVideoFile(null);
      fetchCourses();
    } catch (err) {
      console.error("Error uploading video:", err);
    }
  };

  const handleAddLink = async () => {
    if (!videoLink.trim()) return alert("Please enter a video URL");
    if (!editingCourseId) return;

    try {
      await axios.post(
        `https://flexopted-backend.onrender.com/api/courses/${editingCourseId}/add-link`,
        { link: videoLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowVideoModal(false);
      setVideoLink("");
      fetchCourses();
    } catch (err) {
      console.error("Error adding video link:", err);
    }
  };

  // Horizontal scroll function
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.firstChild;
    if (!card) return;
    const cardWidth = card.offsetWidth + 24; // 24px = gap-6
    scrollRef.current.scrollTo({
      left: direction === "left" 
        ? scrollRef.current.scrollLeft - cardWidth 
        : scrollRef.current.scrollLeft + cardWidth,
      behavior: "smooth",
    });
  };

  if (!user)
    return (
      <p className="text-center mt-10 text-red-500 font-semibold">
        You must be logged in to view the dashboard.
      </p>
    );

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-blue-300 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-pink-300 rounded-full opacity-30 blur-3xl animate-pulse"></div>

      <div className="flex flex-col md:flex-row min-h-screen w-full">
        {/* Sidebar */}
        <aside className="bg-blue-50/90 md:w-1/3 flex flex-col items-center justify-start gap-6 p-6 md:p-8 sticky top-0 h-fit md:h-screen">
          <div className="relative group">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-green-400 to-green-600 text-white text-3xl md:text-4xl font-bold rounded-full flex items-center justify-center shadow-lg">
              {user.name[0].toUpperCase()}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-gray-800 text-white text-xs md:text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              {user.email}
            </div>
          </div>
          <p className="text-xl md:text-2xl font-semibold text-gray-800">Hello, {user.name}!</p>

          {/* Stats */}
          <div className="w-full flex justify-around mt-6 gap-4">
            {/* Courses Card */}
            <div className="flex flex-col items-center bg-white/90 backdrop-blur-md p-4 rounded-xl shadow hover:shadow-lg transition w-1/2">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"
                  />
                </svg>
                <p className="text-gray-800 font-semibold text-sm md:text-base">Courses</p>
              </div>
              <p className="text-gray-900 text-xl md:text-2xl font-bold">{courses.length}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-auto px-4 md:px-6 py-2 md:py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow transition w-full sm:w-auto"
          >
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 overflow-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Instructor Dashboard</h1>

          {/* Add/Edit Course Form */}
          <section className="bg-white p-4 md:p-6 rounded-xl shadow mb-8 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-4 text-center">
              {editingCourseId ? "Edit Course" : "Add New Course"}
            </h2>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Course Title"
                value={form.title}
                onChange={handleChange}
                className="p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 col-span-2"
                required
              />
              <textarea
                name="description"
                placeholder="Course Description"
                value={form.description}
                onChange={handleChange}
                className="p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 col-span-2"
                required
              ></textarea>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-600 font-medium col-span-2"
              >
                {editingCourseId ? "Update Course" : "Add Course"}
              </button>
            </form>
          </section>

          {/* Courses List */}
          {loading ? (
            <p className="text-gray-600 text-center">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-600 text-center">No courses available.</p>
          ) : (
            <div className="relative max-w-full mx-auto">
              {/* Left Arrow */}
              {courses.length > 1 && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100 hidden sm:flex"
                >
                  &#8592;
                </button>
              )}

              <div
                ref={scrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
              >
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="flex-shrink-0 w-full sm:w-[calc((100%/3)-1rem)] md:w-[calc((100%/3)-1.5rem)] bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 flex flex-col justify-between snap-start"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">{course.title}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-4">{course.description}</p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {course.videoLinks?.length > 0 && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full">
                            {course.videoLinks.length} Video(s)
                          </span>
                        )}
                        {studentsByCourse[course.id]?.length > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                            {studentsByCourse[course.id].length} Student(s)
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>

                      {studentsByCourse[course.id]?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Enrolled Students:</p>
                          <div className="max-h-20 overflow-y-auto border rounded p-2 bg-gray-50">
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {studentsByCourse[course.id].map(student => (
                                <li key={student.id}>{student.name} ({student.email})</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-500 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setEditingCourseId(course.id);
                          setUploadMode("file");
                          setVideoFile(null);
                          setVideoLink("");
                          setShowVideoModal(true);
                        }}
                        className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
                      >
                        Add Video
                      </button>

                      <button
                        onClick={() => handleDelete(course.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              {courses.length > 1 && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100 hidden sm:flex"
                >
                  &#8594;
                </button>
              )}
            </div>
          )}

          {/* Video Modal */}
          {showVideoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-3xl p-4 md:p-6 rounded-xl shadow-xl relative">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Add Course Video</h2>

                {/* Tabs */}
                <div className="flex gap-2 md:gap-3 border-b pb-2 mb-4">
                  <button
                    onClick={() => setUploadMode("file")}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-lg ${uploadMode === "file" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setUploadMode("link")}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-lg ${uploadMode === "link" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Add Video Link
                  </button>
                </div>

                {uploadMode === "file" && (
                  <div className="flex flex-col gap-2 md:gap-4">
                    <input
                      key={videoFile ? videoFile.name : "empty"}
                      type="file"
                      accept=".mp4,.mov,.mkv,.avi,.webm,.ogg,.mpeg4"
                      onChange={e => setVideoFile(e.target.files[0])}
                      className="border p-2 rounded"
                    />
                    {videoFile && <p className="text-sm text-gray-600">Selected file: {videoFile.name}</p>}
                    <button
                      onClick={handleVideoUpload}
                      disabled={!videoFile}
                      className="px-4 md:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Upload Video
                    </button>
                  </div>
                )}

                {uploadMode === "link" && (
                  <div className="flex flex-col gap-2 md:gap-4">
                    <input
                      type="text"
                      placeholder="Enter YouTube / Vimeo / Drive URL"
                      value={videoLink}
                      onChange={e => setVideoLink(e.target.value)}
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={handleAddLink}
                      className="px-4 md:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Add Link
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoFile(null);
                    setVideoLink("");
                  }}
                  className="mt-4 md:mt-6 px-4 md:px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 absolute top-4 right-4"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
