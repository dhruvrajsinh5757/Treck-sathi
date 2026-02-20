import { useState } from 'react';

export default function TripCard({
  trip,
  isLiked,
  isJoinRequested,
  onToggleLike,
  onJoinRequest,
}) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  const {
    _id,
    destination,
    date,
    difficulty,
    maxMembers,
    coverImage,
    createdBy,
  } = trip;

  const authorName = createdBy?.name || 'Trekker';
  const authorPhoto =
    createdBy?.profilePhoto ||
    `https://ui-avatars.com/api/?background=22c55e&color=fff&name=${encodeURIComponent(
      authorName
    )}`;

  const formattedDate = date ? new Date(date).toLocaleDateString() : 'Date TBA';

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={authorPhoto}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-trek-400"
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">{authorName}</p>
            <p className="text-xs text-slate-500">{destination}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{formattedDate}</span>
      </header>

      {/* Image / visual */}
      <div className="bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={destination}
            className="w-full max-h-[420px] object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-tr from-trek-600 via-emerald-500 to-sky-500 flex items-center justify-center text-white text-xl font-semibold tracking-wide">
            {destination || 'Trek Adventure'}
          </div>
        )}
      </div>

      {/* Details + actions */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-trek-500" />
            Difficulty:{' '}
            <span className="font-semibold capitalize">
              {difficulty || 'Unknown'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
            👥 Max members:{' '}
            <span className="font-semibold">{maxMembers ?? 'N/A'}</span>
          </span>
          {_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
              #TripID:{' '}
              <span className="font-mono text-[11px] text-slate-500">
                {_id.slice(-6)}
              </span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            {/* Like button */}
            <button
              type="button"
              onClick={onToggleLike}
              className={`inline-flex items-center gap-1 text-sm font-medium transition ${
                isLiked ? 'text-rose-500' : 'text-slate-700 hover:text-rose-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isLiked
                    ? 'bg-rose-100 border-rose-200'
                    : 'border-slate-300 hover:border-rose-300'
                }`}
              >
                {isLiked ? '♥' : '♡'}
              </span>
              Like
            </button>

            {/* Comment button */}
            <button
              type="button"
              onClick={() => setShowCommentBox((v) => !v)}
              className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-trek-600 transition"
            >
              💬 Comment
            </button>
          </div>

          {/* Join request button */}
          <button
            type="button"
            onClick={onJoinRequest}
            disabled={isJoinRequested}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              isJoinRequested
                ? 'border-slate-300 text-slate-400 bg-slate-50 cursor-default'
                : 'border-trek-500 text-trek-600 hover:bg-trek-50'
            }`}
          >
            {isJoinRequested ? 'Request Sent' : 'Join Request'}
          </button>
        </div>

        {/* Comment input (local only) */}
        {showCommentBox && (
          <div className="pt-2 border-t border-slate-100 mt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentText.trim()) return;
                // Not wired to backend yet; for now just clear the field.
                setCommentText('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm px-3 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-trek-500 focus:border-trek-500"
              />
              <button
                type="submit"
                className="text-xs font-semibold text-trek-600 hover:text-trek-700"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

