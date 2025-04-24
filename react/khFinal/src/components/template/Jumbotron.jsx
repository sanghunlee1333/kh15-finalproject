export default function Jumbotron(
    {
        subject = "제목",
        content = "",
        ...rest
    }
) {
    return(
        <div className="row">
            <div className="col">
                <div className="bg-dark text-light p-4 rounded">
                    <h1 className="text-nowrap">{subject}</h1>
                    <p className="text-nowrap">{content}</p>
                </div>
            </div>
        </div>
    );
}