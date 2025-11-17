import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import YouTube from "react-youtube";
import { AuthContext } from "../context/AuthContext";

const CourseDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoIntervals = useRef({}); // store intervals per video

  // Throttle function
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function (...args) {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  // Fetch course and progress
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }

      try {
        const courseRes = await axios.get(
        `https://flexopted-backend.onrender.com/api/courses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
        setCourse(courseRes.data);

        const progressRes = await axios.get(
          `https://flexopted-backend.onrender.com/api/courses/${id}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProgress(progressRes.data.completedVideos || []);
      } catch (err) {
        console.error("Error fetching course or progress:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [id, token]);

  // Save progress before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      progress.forEach(v => {
        throttledUpdate(v.index, v.percent);
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [progress]);

  const extractYouTubeID = (url) => {
    const regExp =
      /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : null;
  };

  const getVideoProgress = (index) => {
    const videoProgress = progress.find((v) => v.index === index);
    return videoProgress ? videoProgress.percent : 0;
  };

  const updateProgress = async (index, percent) => {
    const clampedPercent = Math.min(Math.max(percent, 0), 100);

    setProgress((prev) => {
      const existing = prev.find((v) => v.index === index);
      if (existing) {
        return prev.map((v) =>
          v.index === index
            ? { ...v, percent: Math.max(v.percent, clampedPercent) }
            : v
        );
      } else {
        return [...prev, { index, percent: clampedPercent }];
      }
    });

    try {
      await axios.post(
        `https://flexopted-backend.onrender.com/api/courses/${id}/progress`,
        { videoIndex: index, percent: clampedPercent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error saving progress:", err.response || err);
    }
  };

  const throttledUpdate = throttle(updateProgress, 2000);

  const overallCompletion = () => {
    if (!course?.videoLinks?.length) return 0;
    const totalPercent = course.videoLinks.reduce(
      (sum, _, idx) => sum + getVideoProgress(idx),
      0
    );
    return totalPercent / course.videoLinks.length;
  };

  if (loading)
    return (
      <div className="text-center mt-16 text-gray-600 text-lg font-medium">
        Loading course...
      </div>
    );

  if (!course)
    return (
      <div className="text-center mt-16 text-red-500 text-lg font-semibold">
        Course not found!
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center px-4 py-12">
      <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-4">
        {course.title}
      </h1>

      {course.videoLinks?.length > 0 && (
        <div className="w-full max-w-5xl mb-6">
          <p className="text-gray-700 mb-1 font-medium">
            Overall Completion: {overallCompletion().toFixed(1)}%
          </p>
          <div className="w-full bg-gray-200 h-3 rounded-full relative group">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${overallCompletion()}%`, minWidth: "0.5%" }}
              title={`${overallCompletion().toFixed(1)}% completed`}
            />
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8 border flex flex-col">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {course.description}
        </p>

        {course.instructor && (
          <p className="text-gray-600 mb-6 text-md">
            Instructor:{" "}
            <span className="font-semibold text-gray-800">{course.instructor}</span>
          </p>
        )}

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Course Videos
        </h2>

        {course.videoLinks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {course.videoLinks.map((link, index) => {
              const videoProgress = getVideoProgress(index);

              const youtubeOpts = { width: "100%", height: "200", playerVars: { autoplay: 0 } };

              return (
                <div
                  key={index}
                  className="bg-gray-50 border rounded-xl shadow-sm hover:shadow-md transition p-4"
                >
                  {link.includes("youtube.com") || link.includes("youtu.be") ? (
                    <YouTube
                      videoId={extractYouTubeID(link)}
                      opts={youtubeOpts}
                      onStateChange={(e) => {
                        const player = e.target;
                        const state = e.data;

                        // start interval
                        if (state === 1 && !videoIntervals.current[index]) {
                          videoIntervals.current[index] = setInterval(() => {
                            const duration = player.getDuration();
                            const currentTime = player.getCurrentTime();
                            if (duration > 0)
                              throttledUpdate(index, (currentTime / duration) * 100);
                          }, 1000);
                        }

                        // pause or end
                        if (state === 0 || state === 2) {
                          clearInterval(videoIntervals.current[index]);
                          videoIntervals.current[index] = null;
                        }
                      }}
                    />
                  ) : link.includes("vimeo.com") ? (
                    <iframe
                      className="w-full h-48 rounded-lg"
                      src={link.replace("vimeo.com", "player.vimeo.com/video")}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={link.startsWith("http") ? link : `https://flexopted-backend.onrender.com${link}`}
                      controls
                      className="w-full h-48 rounded-lg bg-black"
                      onTimeUpdate={(e) =>
                        throttledUpdate(index, (e.target.currentTime / e.target.duration) * 100)
                      }
                    />
                  )}

                  <p className="text-gray-600 text-sm mt-2">Video {index + 1}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 relative group">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${videoProgress}%`, minWidth: "0.5%" }}
                      title={`${videoProgress.toFixed(1)}% watched`}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {videoProgress.toFixed(1)}% watched
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 bg-gray-100 border p-4 rounded-lg text-center mt-4">
            No video content available for this course.
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
