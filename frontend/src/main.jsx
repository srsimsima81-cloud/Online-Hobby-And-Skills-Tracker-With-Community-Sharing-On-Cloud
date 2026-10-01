import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  LayoutDashboard,
  Target,
  Clock3,
  Users,
  UserRound,
  LogOut,
  Heart,
  MessageCircle,
  Plus,
  Flame
} from 'lucide-react';
import axios from 'axios';
import './style.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_token');

  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});


/* =========================
   AUTHENTICATION
========================= */

function Auth({ done }) {
  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post(
        '/auth/' + (mode === 'login' ? 'login' : 'register'),
        form
      );

      localStorage.setItem('sc_token', response.data.access_token);
      done();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Request failed. Please check your details.'
      );
    }
  }

  return (
    <div className="auth">

      <div className="pitch">
        <small>CLOUD COMPUTING PROJECT</small>

        <h1>
          Build skills.
          <br />
          <i>Track progress.</i>
          <br />
          Share momentum.
        </h1>

        <p>
          Cloud-based hobby tracking with goals, practice analytics,
          object storage and a learning community.
        </p>
      </div>


      <form className="card login" onSubmit={submit}>

        <div className="logo">
          Hobby <span>& Skills Tracker</span>
        </div>

        <h2>
          {mode === 'login'
            ? 'Welcome back'
            : 'Create account'}
        </h2>


        {mode === 'register' && (
          <>
            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={event =>
                setForm({
                  ...form,
                  name: event.target.value
                })
              }
              required
            />


            <label htmlFor="register-username">
              Username
            </label>

            <input
              id="register-username"
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={event =>
                setForm({
                  ...form,
                  username: event.target.value
                })
              }
              required
            />
          </>
        )}


        <label htmlFor="auth-email">
          Email
        </label>

        <input
          id="auth-email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={event =>
            setForm({
              ...form,
              email: event.target.value
            })
          }
          required
        />


        <label htmlFor="auth-password">
          Password
        </label>

        <input
          id="auth-password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={event =>
            setForm({
              ...form,
              password: event.target.value
            })
          }
          required
        />


        {error && (
          <p className="err">
            {error}
          </p>
        )}


        <button type="submit">
          {mode === 'login'
            ? 'Sign in'
            : 'Create account'}
        </button>


        <a
          onClick={() => {
            setMode(
              mode === 'login'
                ? 'register'
                : 'login'
            );
            setError('');
          }}
        >
          {mode === 'login'
            ? 'Create account'
            : 'Sign in'}
        </a>

      </form>

    </div>
  );
}


/* =========================
   MAIN APP
========================= */

function App() {

  const [token, setToken] = useState(
    localStorage.getItem('sc_token')
  );

  const [tab, setTab] = useState('dashboard');

  const [profile, setProfile] = useState(null);

  const [message, setMessage] = useState('');


  useEffect(() => {

    if (token) {
      api
        .get('/profile')
        .then(response => {
          setProfile(response.data);
        })
        .catch(() => {
          localStorage.removeItem('sc_token');
          setToken(null);
        });
    }

  }, [token]);


  if (!token) {
    return (
      <Auth
        done={() =>
          setToken(
            localStorage.getItem('sc_token')
          )
        }
      />
    );
  }


  function logout() {
    localStorage.removeItem('sc_token');
    setToken(null);
    setProfile(null);
  }


  return (
    <div className="shell">

      <aside>

        <div className="logo">
          SkillSpace
          <span>Hobby & Skills Tracker</span>
        </div>


        {[
          ['dashboard', 'Dashboard', LayoutDashboard],
          ['skills', 'Skills & Goals', Target],
          ['practice', 'Practice', Clock3],
          ['community', 'Community', Users],
          ['profile', 'Profile', UserRound]
        ].map(([id, name, Icon]) => (

          <button
            key={id}
            className={
              tab === id
                ? 'nav active'
                : 'nav'
            }
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {name}
          </button>

        ))}


        <button
          className="nav logout"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </aside>


      <main>

        <header>

          <div>

            <small>
              CLOUD LEARNING WORKSPACE
            </small>

            <h1>
              {
                tab === 'dashboard'
                  ? 'Dashboard'
                  : tab === 'skills'
                  ? 'Skills & Goals'
                  : tab === 'practice'
                  ? 'Practice Lab'
                  : tab === 'community'
                  ? 'Community Feed'
                  : 'My Profile'
              }
            </h1>

          </div>


          <span className="user">
            {profile?.name}
          </span>

        </header>


        {message && (
          <div
            className="msg"
            onClick={() => setMessage('')}
          >
            {message}
          </div>
        )}


        {tab === 'dashboard' && (
          <Dashboard />
        )}

        {tab === 'skills' && (
          <Skills setMsg={setMessage} />
        )}

        {tab === 'practice' && (
          <Practice setMsg={setMessage} />
        )}

        {tab === 'community' && (
          <Community setMsg={setMessage} />
        )}

        {tab === 'profile' && (
          <Profile
            p={profile}
            setP={setProfile}
            setMsg={setMessage}
          />
        )}

      </main>

    </div>
  );
}


/* =========================
   DASHBOARD
========================= */

function Dashboard() {

  const [data, setData] = useState(null);

  const [skills, setSkills] = useState([]);


  useEffect(() => {

    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/skills')
    ]).then(([analytics, skillResponse]) => {

      setData(analytics.data);
      setSkills(skillResponse.data);

    });

  }, []);


  if (!data) {
    return (
      <div className="loading">
        Loading cloud data...
      </div>
    );
  }


  const chartData =
    Object.entries(
      data.practice_hours_by_skill
    ).map(([name, hours]) => ({
      name,
      hours
    }));


  return (
    <section className="content">

      <div className="hero">

        <div>

          <small>
            YOUR CLOUD WORKSPACE
          </small>

          <h2>
            Make small progress visible.
          </h2>

          <p>
            Track practice, turn goals into milestones
            and share achievements.
          </p>

        </div>


        <div className="ring">

          <b>
            {data.weekly_practice_hours}
          </b>

          <small>
            hours
            <br />
            this week
          </small>

        </div>

      </div>


      <div className="stats">

        {[
          [
            Clock3,
            'Total practice',
            data.total_practice_hours + 'h',
            'this month ' +
              data.monthly_practice_hours +
              'h'
          ],

          [
            Flame,
            'Current streak',
            data.current_streak + 'd',
            'longest ' +
              data.longest_streak +
              'd'
          ],

          [
            Target,
            'Goals',
            data.goals_completed,
            data.active_goals + ' active'
          ],

          [
            Heart,
            'Likes received',
            data.likes_received,
            data.comments_received +
              ' comments'
          ]
        ].map(([Icon, title, value, detail]) => (

          <div
            className="stat"
            key={title}
          >

            <Icon />

            <small>
              {title}
            </small>

            <strong>
              {value}
            </strong>

            <span>
              {detail}
            </span>

          </div>

        ))}

      </div>


      <div className="twocol">

        <div className="card">

          <small>
            ANALYTICS
          </small>

          <h3>
            Practice by skill
          </h3>

          <ResponsiveContainer
  width="100%"
  height={260}
>
  <BarChart
    data={chartData}
    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
  >

    <CartesianGrid
      stroke="rgba(255,255,255,0.12)"
      vertical={false}
    />

    <XAxis
      dataKey="name"
      tick={{ fill: "#cbd5e1", fontSize: 12 }}
      axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
      tickLine={false}
    />

    <YAxis
      tick={{ fill: "#cbd5e1", fontSize: 12 }}
      axisLine={false}
      tickLine={false}
      allowDecimals={true}
    />

    <Tooltip
      contentStyle={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        color: "#ffffff"
      }}
      labelStyle={{ color: "#ffffff" }}
    />

    <Bar
      dataKey="hours"
      fill="#00e5ff"
      radius={[6, 6, 0, 0]}
    />

  </BarChart>
</ResponsiveContainer>

        </div>


        <div className="card">

          <small>
            ACTIVE SKILLS
          </small>

          <h3>
            Your learning portfolio
          </h3>


          {skills.map(skill => (

            <div
              className="row"
              key={skill.skill_id}
            >

              <span className="bubble">
                {skill.skill_name?.[0]}
              </span>

              <div>

                <b>
                  {skill.skill_name}
                </b>

                <small>
                  {skill.category}
                  {' · '}
                  {skill.current_level}
                </small>

              </div>

              <em>
                {skill.status}
              </em>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}


/* =========================
   SKILLS & GOALS
========================= */

function Skills({ setMsg }) {

  const [skills, setSkills] = useState([]);
  const [goals, setGoals] = useState([]);

  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    category: '',
    current_level: 'BEGINNER',
    target_level: 'INTERMEDIATE',
    status: 'ACTIVE',
    description: ''
  });

  const [goalForm, setGoalForm] = useState({
    skill_id: '',
    title: '',
    target_value: '',
    unit: 'hours'
  });


  function load() {

    return Promise.all([
      api.get('/skills'),
      api.get('/goals')
    ]).then(([skillResponse, goalResponse]) => {

      setSkills(skillResponse.data);
      setGoals(goalResponse.data);

      if (
        !goalForm.skill_id &&
        skillResponse.data.length > 0
      ) {
        setGoalForm(current => ({
          ...current,
          skill_id: skillResponse.data[0].skill_id
        }));
      }

    });

  }


  useEffect(() => {
    load();
  }, []);


  async function createSkill(event) {

    event.preventDefault();

    try {

      await api.post('/skills', skillForm);

      setSkillForm({
        skill_name: '',
        category: '',
        current_level: 'BEGINNER',
        target_level: 'INTERMEDIATE',
        status: 'ACTIVE',
        description: ''
      });

      setMsg('Skill or hobby created');

      load();

    } catch (err) {

      setMsg(
        err.response?.data?.detail ||
        'Unable to create skill'
      );

    }

  }


  async function createGoal(event) {

    event.preventDefault();

    try {

      await api.post('/goals', goalForm);

      setGoalForm(current => ({
        ...current,
        title: '',
        target_value: ''
      }));

      setMsg('Goal created');

      load();

    } catch (err) {

      setMsg(
        err.response?.data?.detail ||
        'Unable to create goal'
      );

    }

  }


  return (
    <section className="content">

      <div className="twocol">


        {/* =========================
            SKILLS
        ========================= */}

        <div className="card">

          <small>
            SKILLS & HOBBIES
          </small>

          <h3>
            Your skills and hobbies
          </h3>


          {/* EXISTING SKILLS */}

          {skills.length === 0 ? (

            <p>
              No skills or hobbies added yet.
            </p>

          ) : (

            <div className="skill-list">

              {skills.map(skill => (

                <div
                  className="row"
                  key={skill.skill_id}
                >

                  <span className="bubble">
                    {skill.skill_name?.[0]?.toUpperCase()}
                  </span>

                  <div>

                    <b>
                      {skill.skill_name}
                    </b>

                    <small>
                      {skill.category}
                      {' · '}
                      {skill.current_level}
                      {' → '}
                      {skill.target_level}
                    </small>

                  </div>

                  <em>
                    {skill.status}
                  </em>

                </div>

              ))}

            </div>

          )}


          {/* ADD NEW SKILL */}

          <div className="section-divider" />

          <small>
            ADD NEW SKILL OR HOBBY
          </small>


          <form
            onSubmit={createSkill}
            className="mini"
          >

            <label htmlFor="skill-name">
              Skill / Hobby Name
            </label>

            <input
              id="skill-name"
              type="text"
              placeholder="Enter a skill or hobby"
              value={skillForm.skill_name}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  skill_name: event.target.value
                })
              }
              required
            />


            <label htmlFor="skill-category">
              Category
            </label>

            <input
              id="skill-category"
              type="text"
              placeholder="e.g. Technology, Art, Music"
              value={skillForm.category}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  category: event.target.value
                })
              }
              required
            />


            <label htmlFor="current-level">
              Current Level
            </label>

            <select
              id="current-level"
              value={skillForm.current_level}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  current_level: event.target.value
                })
              }
            >

              <option value="BEGINNER">
                Beginner
              </option>

              <option value="INTERMEDIATE">
                Intermediate
              </option>

              <option value="ADVANCED">
                Advanced
              </option>

            </select>


            <label htmlFor="target-level">
              Target Level
            </label>

            <select
              id="target-level"
              value={skillForm.target_level}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  target_level: event.target.value
                })
              }
            >

              <option value="BEGINNER">
                Beginner
              </option>

              <option value="INTERMEDIATE">
                Intermediate
              </option>

              <option value="ADVANCED">
                Advanced
              </option>

            </select>


            <label htmlFor="skill-status">
              Status
            </label>

            <select
              id="skill-status"
              value={skillForm.status}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  status: event.target.value
                })
              }
            >

              <option value="ACTIVE">
                Active
              </option>

              <option value="PAUSED">
                Paused
              </option>

              <option value="COMPLETED">
                Completed
              </option>

            </select>


            <label htmlFor="skill-description">
              Description
            </label>

            <textarea
              id="skill-description"
              placeholder="Describe your learning activity"
              value={skillForm.description}
              onChange={event =>
                setSkillForm({
                  ...skillForm,
                  description: event.target.value
                })
              }
            />


            <button type="submit">
              <Plus size={15} />
              Add Skill / Hobby
            </button>

          </form>

        </div>


        {/* =========================
            GOALS
        ========================= */}

        <div className="card">

          <small>
            GOALS
          </small>

          <h3>
            Learning goals
          </h3>


          {goals.length === 0 ? (

            <p>
              No learning goals created yet.
            </p>

          ) : (

            goals.map(goal => (

              <div
                className="goal"
                key={goal.goal_id}
              >

                <b>
                  {goal.title}
                </b>

                <span>
                  {goal.progress}%
                </span>

                <div>
                  <i
                    style={{
                      width: goal.progress + '%'
                    }}
                  />
                </div>

                <small>
                  {goal.current_value}
                  {' / '}
                  {goal.target_value}
                  {' '}
                  {goal.unit}
                </small>

              </div>

            ))

          )}


          <div className="section-divider" />

          <form
            className="stack"
            onSubmit={createGoal}
          >

            <label htmlFor="goal-skill">
              Skill / Hobby
            </label>

            <select
              id="goal-skill"
              value={goalForm.skill_id}
              onChange={event =>
                setGoalForm({
                  ...goalForm,
                  skill_id: event.target.value
                })
              }
              required
            >

              <option value="">
                Select a skill or hobby
              </option>

              {skills.map(skill => (

                <option
                  key={skill.skill_id}
                  value={skill.skill_id}
                >
                  {skill.skill_name}
                </option>

              ))}

            </select>


            <label htmlFor="goal-title">
              Goal Title
            </label>

            <input
              id="goal-title"
              type="text"
              placeholder="Enter your learning goal"
              value={goalForm.title}
              onChange={event =>
                setGoalForm({
                  ...goalForm,
                  title: event.target.value
                })
              }
              required
            />


            <label htmlFor="goal-target">
              Target Value
            </label>

            <input
              id="goal-target"
              type="number"
              min="1"
              placeholder="e.g. 20"
              value={goalForm.target_value}
              onChange={event =>
                setGoalForm({
                  ...goalForm,
                  target_value: event.target.value
                })
              }
              required
            />


            <label htmlFor="goal-unit">
              Unit
            </label>

            <select
              id="goal-unit"
              value={goalForm.unit}
              onChange={event =>
                setGoalForm({
                  ...goalForm,
                  unit: event.target.value
                })
              }
            >

              <option value="hours">
                Hours
              </option>

              <option value="sessions">
                Sessions
              </option>

              <option value="projects">
                Projects
              </option>

              <option value="days">
                Days
              </option>

            </select>


            <button type="submit">
              Create Goal
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}

/* =========================
   PRACTICE
========================= */

function Practice({ setMsg }) {

  const [skills, setSkills] = useState([]);

  const [practice, setPractice] = useState([]);


  const [form, setForm] = useState({
    skill_id: '',
    duration_minutes: '',
    activity: '',
    notes: ''
  });


  function load() {

    return Promise.all([
      api.get('/skills'),
      api.get('/practice')
    ]).then(([skillResponse, practiceResponse]) => {

      setSkills(skillResponse.data);
      setPractice(practiceResponse.data);

      if (
        !form.skill_id &&
        skillResponse.data.length > 0
      ) {
        setForm(current => ({
          ...current,
          skill_id:
            skillResponse.data[0].skill_id
        }));
      }

    });

  }


  useEffect(() => {

    load();

  }, []);


  async function savePractice(event) {

    event.preventDefault();

    try {

      await api.post(
        '/practice',
        {
          ...form,
          duration_minutes:
            Number(form.duration_minutes)
        }
      );

      setForm(current => ({
        ...current,
        duration_minutes: '',
        activity: '',
        notes: ''
      }));

      setMsg(
        'Practice session recorded; progress updated'
      );

      load();

    } catch (err) {

      setMsg(
        err.response?.data?.detail ||
        'Unable to record practice'
      );

    }

  }


  return (
    <section className="content">

      <div className="twocol">


        <div className="card">

          <small>
            PRACTICE SESSION
          </small>

          <h3>
            Record your work
          </h3>


          <form
            className="stack"
            onSubmit={savePractice}
          >

            <label htmlFor="practice-skill">
              Skill / Hobby
            </label>

            <select
              id="practice-skill"
              value={form.skill_id}
              onChange={event =>
                setForm({
                  ...form,
                  skill_id:
                    event.target.value
                })
              }
              required
            >

              <option value="">
                Select a skill or hobby
              </option>

              {skills.map(skill => (

                <option
                  key={skill.skill_id}
                  value={skill.skill_id}
                >
                  {skill.skill_name}
                </option>

              ))}

            </select>


            <label htmlFor="practice-duration">
              Duration (minutes)
            </label>

            <input
              id="practice-duration"
              type="number"
              min="1"
              placeholder="e.g. 60"
              value={form.duration_minutes}
              onChange={event =>
                setForm({
                  ...form,
                  duration_minutes:
                    event.target.value
                })
              }
              required
            />


            <label htmlFor="practice-activity">
              Activity
            </label>

            <input
              id="practice-activity"
              type="text"
              placeholder="What did you practice?"
              value={form.activity}
              onChange={event =>
                setForm({
                  ...form,
                  activity:
                    event.target.value
                })
              }
              required
            />


            <label htmlFor="practice-notes">
              Notes
            </label>

            <textarea
              id="practice-notes"
              placeholder="Add optional notes"
              value={form.notes}
              onChange={event =>
                setForm({
                  ...form,
                  notes:
                    event.target.value
                })
              }
            />


            <button type="submit">
              Save Session
            </button>

          </form>

        </div>


        <div className="card">

          <small>
            ACTIVITY LOG
          </small>

          <h3>
            Recent sessions
          </h3>


          {practice.length === 0 && (
            <p>
              No practice sessions yet.
            </p>
          )}


          {practice
            .slice(0, 10)
            .map(session => (

              <div
                className="activity"
                key={session.session_id}
              >

                <Flame size={16} />

                <div>

                  <b>
                    {session.activity}
                  </b>

                  <small>
                    {session.duration_minutes}
                    {' minutes · '}
                    {new Date(
                      session.practiced_at
                    ).toLocaleDateString()}
                  </small>

                </div>

              </div>

            ))}

        </div>

      </div>

    </section>
  );
}


/* =========================
   COMMUNITY
========================= */

function Community({ setMsg }) {

  const [posts, setPosts] = useState([]);

  const [text, setText] = useState('');


  function load() {

    return api
      .get('/feed')
      .then(response => {
        setPosts(response.data);
      });

  }


  useEffect(() => {

    load();

  }, []);


  async function createPost() {

    if (!text.trim()) {
      return;
    }

    try {

      await api.post('/posts', {
        content: text
      });

      setText('');

      setMsg('Achievement shared');

      load();

    } catch (err) {

      setMsg(
        err.response?.data?.detail ||
        'Unable to create post'
      );

    }

  }


  return (
    <section className="content">

      <div className="community">


        <div>

          <div className="card composer">

            <label htmlFor="community-post">
              Share with the community
            </label>

            <input
              id="community-post"
              type="text"
              placeholder="Share a learning achievement..."
              value={text}
              onChange={event =>
                setText(event.target.value)
              }
            />

            <button
              type="button"
              onClick={createPost}
            >
              Post
            </button>

          </div>


          {posts.map(post => (

            <article
              className="card post"
              key={post.post_id}
            >

              <div className="postuser">

                <span className="bubble">
                  {post.name?.[0]}
                </span>

                <div>

                  <b>
                    {post.name}
                  </b>

                  <small>
                    @{post.username}
                    {' · '}
                    {new Date(
                      post.created_at
                    ).toLocaleString()}
                  </small>

                </div>

              </div>


              <p>
                {post.content}
              </p>


              {post.skill_name && (
                <em>
                  #{post.skill_name}
                </em>
              )}


              <div className="actions">

                <button
                  type="button"
                  onClick={async () => {

                    await api.post(
                      '/posts/' +
                      post.post_id +
                      '/like'
                    );

                    load();

                  }}
                  className={
                    post.liked_by_me
                      ? 'liked'
                      : ''
                  }
                >

                  <Heart size={16} />

                  {' '}

                  {post.likes_count}

                </button>


                <button
                  type="button"
                  onClick={async () => {

                    const comment =
                      prompt(
                        'Enter your comment'
                      );

                    if (comment) {

                      await api.post(
                        '/posts/' +
                        post.post_id +
                        '/comments',
                        {
                          content: comment
                        }
                      );

                      load();

                    }

                  }}
                >

                  <MessageCircle size={16} />

                  {' '}

                  {post.comments_count}

                </button>

              </div>

            </article>

          ))}

        </div>


        <div className="card">

          <small>
            COMMUNITY
          </small>

          <h3>
            Trending skills
          </h3>

          <p>
            #Photography
          </p>

          <p>
            #Coding
          </p>

          <p>
            #Music
          </p>

          <p>
            #Design
          </p>

        </div>

      </div>

    </section>
  );
}


/* =========================
   PROFILE
========================= */

function Profile({ p, setP, setMsg }) {

  const [form, setForm] = useState({
    name: p?.name || '',
    bio: p?.bio || '',
    interests: p?.interests || ''
  });


  async function saveProfile(event) {

    event.preventDefault();

    try {

      const response = await api.put(
        '/profile',
        form
      );

      setP(response.data);

      setMsg('Profile updated');

    } catch (err) {

      setMsg(
        err.response?.data?.detail ||
        'Unable to update profile'
      );

    }

  }


  return (
    <section className="content">

      <div className="profile">

        <span className="profilebubble">
          {p?.name?.[0]}
        </span>

        <div>

          <small>
            PUBLIC PROFILE
          </small>

          <h2>
            {p?.name}
          </h2>

          <span>
            @{p?.username}
            {' · '}
            {p?.email}
          </span>

        </div>

      </div>


      <div className="card profilecard">

        <small>
          PROFILE SETTINGS
        </small>


        <form
          className="stack"
          onSubmit={saveProfile}
        >

          <label htmlFor="profile-name">
            Name
          </label>

          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={event =>
              setForm({
                ...form,
                name:
                  event.target.value
              })
            }
            required
          />


          <label htmlFor="profile-bio">
            Bio
          </label>

          <textarea
            id="profile-bio"
            placeholder="Tell the community about yourself"
            value={form.bio}
            onChange={event =>
              setForm({
                ...form,
                bio:
                  event.target.value
              })
            }
          />


          <label htmlFor="profile-interests">
            Interests
          </label>

          <input
            id="profile-interests"
            type="text"
            placeholder="e.g. Technology, Photography, Music"
            value={form.interests}
            onChange={event =>
              setForm({
                ...form,
                interests:
                  event.target.value
              })
            }
          />


          <button type="submit">
            Save Profile
          </button>

        </form>

      </div>

    </section>
  );
}


createRoot(
  document.getElementById('root')
).render(
  <App />
);